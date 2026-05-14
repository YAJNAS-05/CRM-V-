package com.everx.finance.payment;

import com.everx.finance.fx.FxRateLock;
import com.everx.finance.fx.FxRateLockingService;
import com.everx.finance.invoice.Invoice;
import com.everx.finance.invoice.InvoiceRepository;
import com.everx.finance.period.PostingPeriodEnforcer;
import com.everx.finance.posting.GlPostingService;
import com.everx.finance.tolerance.ThreeWayMatchResult;
import com.everx.finance.tolerance.ThreeWayMatchService;
import com.everx.finance.payment.dto.CreatePaymentRequest;
import com.everx.finance.payment.dto.PaymentResponse;
import com.everx.shared.exception.DuplicatePaymentException;
import com.everx.shared.exception.EntityNotFoundException;
import com.everx.shared.exception.PaymentHoldException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;
    private final PostingPeriodEnforcer postingPeriodEnforcer;
    private final FxRateLockingService fxRateLockingService;
    private final GlPostingService glPostingService;
    private final PaymentDeduplicationService paymentDeduplicationService;
    private final ThreeWayMatchService threeWayMatchService;

    @Transactional(readOnly = true)
    public Page<PaymentResponse> getAllPayments(Pageable pageable) {
        return paymentRepository.findByIsDeletedFalse(pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(UUID id) {
        Payment payment = paymentRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Payment not found with id: " + id));
        return toResponse(payment);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsByInvoice(UUID invoiceId) {
        return paymentRepository.findByInvoiceId(invoiceId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public PaymentResponse createPayment(CreatePaymentRequest request) {
        // Idempotency guard – reject duplicate submissions within the TTL window
        String idempotencyKey = request.getIdempotencyKey();
        if (paymentDeduplicationService.isDuplicate(idempotencyKey)) {
            java.util.UUID existingId = paymentDeduplicationService.getPaymentId(idempotencyKey);
            log.warn("Duplicate payment request detected. idempotencyKey={} existingPaymentId={}",
                    idempotencyKey, existingId);
            throw new DuplicatePaymentException(
                    "Duplicate payment request. Payment " + existingId + " already processed for this key.");
        }

        Invoice invoice = invoiceRepository.findByIdAndIsDeletedFalse(request.getInvoiceId())
                .orElseThrow(() -> new EntityNotFoundException("Invoice not found with id: " + request.getInvoiceId()));

        postingPeriodEnforcer.enforcePostingAllowed(invoice.getEntity().name(), request.getPaymentDate());
        postingPeriodEnforcer.enforceNoBackdating(request.getPaymentDate());

        // Three-way match guard: if this invoice is linked to a PO, validate PO → Receipt → Invoice
        if (invoice.getPoId() != null) {
            try {
                ThreeWayMatchResult matchResult = threeWayMatchService.matchPoReceiptInvoice(invoice.getPoId());
                if (matchResult.isVarianceExceedsTolerance()) {
                    throw new PaymentHoldException(
                        String.format("Payment blocked: 3-way match variance of %s exceeds tolerance for PO linked to invoice %s. Reason: %s",
                            matchResult.getVarianceAmount(), invoice.getInvoiceNumber(), matchResult.getVarianceReason()));
                }
            } catch (com.everx.shared.exception.ValidationException e) {
                // No receipt or invoice found for PO yet – allow payment through
                log.warn("3-way match skipped for invoice {} (poId={}): {}",
                        invoice.getInvoiceNumber(), invoice.getPoId(), e.getMessage());
            }
        }

        Payment payment = Payment.builder()
                .invoiceId(request.getInvoiceId())
                .amount(request.getAmount())
                .currency(request.getCurrency())
                .paymentDate(request.getPaymentDate())
                .method(request.getMethod())
                .reference(request.getReference())
                .exchangeRate(request.getExchangeRate())
                .audEquivalent(request.getAudEquivalent())
                .notes(request.getNotes())
                .build();

        payment.setCreatedAt(OffsetDateTime.now());
        payment.setUpdatedAt(OffsetDateTime.now());

        Payment saved = paymentRepository.save(payment);

        fxRateLockingService.getLockForInvoice(invoice.getId()).ifPresent(lock -> {
            BigDecimal actualBaseAmount = resolveActualBaseAmount(request, lock);
            if (actualBaseAmount != null) {
                BigDecimal fxGainLoss = fxRateLockingService.calculateFxGainLoss(
                    invoice.getId(),
                    request.getAmount(),
                    lock,
                    actualBaseAmount
                );
                glPostingService.postFxGainLoss(
                    saved.getId(),
                    fxGainLoss,
                    lock.getBaseCurrency(),
                    request.getPaymentDate(),
                    invoice.getEntity().name()
                );
            } else {
                log.warn("FX lock found for invoice {} but no base amount provided", invoice.getId());
            }
        });

        // Post AR payment to GL  DR Cash / CR AR
        glPostingService.postPaymentToGL(saved, invoice);

        // Register idempotency key after successful persistence
        paymentDeduplicationService.register(idempotencyKey, saved.getId());

        // Update invoice paid amount
        BigDecimal currentPaid = invoice.getPaidAmount() != null ? invoice.getPaidAmount() : BigDecimal.ZERO;
        BigDecimal newPaid = currentPaid.add(request.getAmount());
        invoice.setPaidAmount(newPaid);

        // Update invoice status based on payment
        if (newPaid.compareTo(invoice.getTotalAmount()) >= 0) {
            invoice.setStatus(Invoice.InvoiceStatus.PAID);
        } else if (newPaid.compareTo(BigDecimal.ZERO) > 0) {
            invoice.setStatus(Invoice.InvoiceStatus.PARTIALLY_PAID);
        }

        invoice.setUpdatedAt(OffsetDateTime.now());
        invoiceRepository.save(invoice);

        return toResponse(saved);
    }

    private BigDecimal resolveActualBaseAmount(CreatePaymentRequest request, FxRateLock lock) {
        if (request.getExchangeRate() != null) {
            return request.getAmount().multiply(request.getExchangeRate());
        }
        if (request.getAudEquivalent() != null && "AUD".equalsIgnoreCase(lock.getBaseCurrency())) {
            return request.getAudEquivalent();
        }
        return null;
    }

    @Transactional
    public void deletePayment(UUID id) {
        Payment payment = paymentRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Payment not found with id: " + id));

        // Update invoice paid amount
        Invoice invoice = invoiceRepository.findByIdAndIsDeletedFalse(payment.getInvoiceId())
                .orElseThrow(() -> new EntityNotFoundException("Invoice not found"));

        BigDecimal currentPaid = invoice.getPaidAmount() != null ? invoice.getPaidAmount() : BigDecimal.ZERO;
        BigDecimal newPaid = currentPaid.subtract(payment.getAmount());
        invoice.setPaidAmount(newPaid.max(BigDecimal.ZERO));

        // Update invoice status
        if (newPaid.compareTo(BigDecimal.ZERO) == 0) {
            invoice.setStatus(Invoice.InvoiceStatus.SENT);
        } else if (newPaid.compareTo(invoice.getTotalAmount()) < 0) {
            invoice.setStatus(Invoice.InvoiceStatus.PARTIALLY_PAID);
        }

        invoice.setUpdatedAt(OffsetDateTime.now());
        invoiceRepository.save(invoice);

        payment.setIsDeleted(true);
        payment.setUpdatedAt(OffsetDateTime.now());
        paymentRepository.save(payment);
    }

    private PaymentResponse toResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .invoiceId(payment.getInvoiceId())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .paymentDate(payment.getPaymentDate())
                .method(payment.getMethod())
                .reference(payment.getReference())
                .exchangeRate(payment.getExchangeRate())
                .audEquivalent(payment.getAudEquivalent())
                .notes(payment.getNotes())
                .createdAt(payment.getCreatedAt().toLocalDateTime())
                .updatedAt(payment.getUpdatedAt().toLocalDateTime())
                .build();
    }
}
