package com.everx.finance.payment;

import com.everx.finance.invoice.Invoice;
import com.everx.finance.invoice.InvoiceRepository;
import com.everx.finance.payment.dto.CreatePaymentRequest;
import com.everx.finance.payment.dto.PaymentResponse;
import com.everx.shared.exception.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
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
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;

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
        Invoice invoice = invoiceRepository.findByIdAndIsDeletedFalse(request.getInvoiceId())
                .orElseThrow(() -> new EntityNotFoundException("Invoice not found with id: " + request.getInvoiceId()));

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
