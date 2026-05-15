package com.everx.finance.invoice;

import com.everx.erp.numbering.DocumentNumberGenerator;
import com.everx.finance.invoice.dto.CreateInvoiceRequest;
import com.everx.finance.invoice.dto.InvoiceResponse;
import com.everx.finance.invoice.dto.UpdateInvoiceRequest;
import com.everx.finance.fx.FxRateLockingService;
import com.everx.finance.period.PostingPeriodEnforcer;
import com.everx.finance.period.PostingPeriodService;
import com.everx.finance.posting.GlPostingService;
import com.everx.shared.exception.AccountingImmutabilityException;
import com.everx.shared.exception.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final PostingPeriodService postingPeriodService;
    private final PostingPeriodEnforcer postingPeriodEnforcer;
    private final FxRateLockingService fxRateLockingService;
    private final GlPostingService glPostingService;
    private final DocumentNumberGenerator documentNumberGenerator;

    private static final Set<Invoice.InvoiceStatus> IMMUTABLE_STATUSES = new HashSet<>(List.of(
        Invoice.InvoiceStatus.SENT,
        Invoice.InvoiceStatus.PARTIALLY_PAID,
        Invoice.InvoiceStatus.PAID,
        Invoice.InvoiceStatus.OVERDUE,
        Invoice.InvoiceStatus.VOID
    ));

    /**
     * Asserts that an invoice is in a mutable state (DRAFT).
     * Throws AccountingImmutabilityException if the invoice is posted/immutable.
     * 
     * @param invoice The invoice to check
     * @throws AccountingImmutabilityException if invoice is immutable
     */
    private void assertInvoiceMutable(Invoice invoice) {
        if (IMMUTABLE_STATUSES.contains(invoice.getStatus())) {
            throw new AccountingImmutabilityException(
                "Invoice " + invoice.getInvoiceNumber() + " cannot be edited. " +
                "Status: " + invoice.getStatus() + ". Use Reverse to correct."
            );
        }
    }

    @Transactional(readOnly = true)
    public Page<InvoiceResponse> getAllInvoices(Pageable pageable) {
        return invoiceRepository.findByIsDeletedFalse(pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public InvoiceResponse getInvoiceById(UUID id) {
        Invoice invoice = invoiceRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Invoice not found with id: " + id));
        return toResponse(invoice);
    }

    @Transactional(readOnly = true)
    public InvoiceResponse getInvoiceByNumber(String invoiceNumber) {
        Invoice invoice = invoiceRepository.findByInvoiceNumberAndIsDeletedFalse(invoiceNumber)
                .orElseThrow(() -> new EntityNotFoundException("Invoice not found with number: " + invoiceNumber));
        return toResponse(invoice);
    }

    @Transactional(readOnly = true)
    public Page<InvoiceResponse> getInvoicesByAccount(UUID accountId, Pageable pageable) {
        return invoiceRepository.findByAccountId(accountId, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<InvoiceResponse> getInvoicesByStatus(Invoice.InvoiceStatus status, Pageable pageable) {
        return invoiceRepository.findByStatus(status, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<InvoiceResponse> getInvoicesByEntity(Invoice.InvoiceEntity entity, Pageable pageable) {
        return invoiceRepository.findByEntity(entity, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<InvoiceResponse> getOverdueInvoices() {
        return invoiceRepository.findOverdueInvoices(LocalDate.now())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public InvoiceResponse createInvoice(CreateInvoiceRequest request) {
        String invoiceNumber = request.getInvoiceNumber();
        if (invoiceNumber == null || invoiceNumber.isEmpty()) {
            invoiceNumber = generateInvoiceNumber(request.getEntity());
        }

        // Enforce posting period is open before creating invoice
        postingPeriodService.assertPeriodOpen(request.getEntity().name(), request.getIssueDate());
        postingPeriodEnforcer.enforceNoBackdating(request.getIssueDate());

        Invoice invoice = Invoice.builder()
                .invoiceNumber(invoiceNumber)
                .soId(request.getSoId())
            .poId(request.getPoId())
                .accountId(request.getAccountId())
                .entity(request.getEntity())
                .type(request.getType())
                .status(Invoice.InvoiceStatus.DRAFT)
                .issueDate(request.getIssueDate())
                .dueDate(request.getDueDate())
                .currency(request.getCurrency())
                .subtotal(request.getSubtotal())
                .taxAmount(request.getTaxAmount())
                .totalAmount(request.getTotalAmount())
                .paidAmount(BigDecimal.ZERO)
                .notes(request.getNotes())
                .build();

        invoice.setCreatedAt(OffsetDateTime.now());
        invoice.setUpdatedAt(OffsetDateTime.now());

        Invoice saved = invoiceRepository.save(invoice);

        fxRateLockingService.lockRatesForInvoice(
            saved.getId(),
            saved.getEntity(),
            saved.getCurrency(),
            saved.getIssueDate()
        );

        return toResponse(saved);
    }

    @Transactional
    public InvoiceResponse updateInvoice(UUID id, UpdateInvoiceRequest request) {
        Invoice invoice = invoiceRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Invoice not found with id: " + id));

        // Check immutability before allowing updates
        assertInvoiceMutable(invoice);

        if (request.getStatus() != null) invoice.setStatus(request.getStatus());
        if (request.getIssueDate() != null) invoice.setIssueDate(request.getIssueDate());
        if (request.getDueDate() != null) invoice.setDueDate(request.getDueDate());
        if (request.getSubtotal() != null) invoice.setSubtotal(request.getSubtotal());
        if (request.getTaxAmount() != null) invoice.setTaxAmount(request.getTaxAmount());
        if (request.getTotalAmount() != null) invoice.setTotalAmount(request.getTotalAmount());
        if (request.getPdfUrl() != null) invoice.setPdfUrl(request.getPdfUrl());
        if (request.getNotes() != null) invoice.setNotes(request.getNotes());

        invoice.setUpdatedAt(OffsetDateTime.now());

        Invoice updated = invoiceRepository.save(invoice);
        return toResponse(updated);
    }

    @Transactional
    public void deleteInvoice(UUID id) {
        Invoice invoice = invoiceRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Invoice not found with id: " + id));
        invoice.setIsDeleted(true);
        invoice.setUpdatedAt(OffsetDateTime.now());
        invoiceRepository.save(invoice);
    }

    /**
     * Update invoice status with REPEATABLE_READ isolation.
     * Prevents race conditions during concurrent approval workflows.
     * 
     * @param id Invoice ID
     * @param status New status
     * @return Updated invoice response
     */
    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public InvoiceResponse updateInvoiceStatus(UUID id, Invoice.InvoiceStatus status) {
        Invoice invoice = invoiceRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Invoice not found with id: " + id));

        Invoice.InvoiceStatus previousStatus = invoice.getStatus();
        invoice.setStatus(status);
        invoice.setUpdatedAt(OffsetDateTime.now());
        Invoice updated = invoiceRepository.save(invoice);

        // Post to GL when invoice transitions to SENT (first time it leaves DRAFT)
        if (status == Invoice.InvoiceStatus.SENT
                && previousStatus == Invoice.InvoiceStatus.DRAFT) {
            try {
                glPostingService.postInvoiceToGL(updated, "AR_INVOICE");
            } catch (Exception e) {
                log.error("GL posting failed for invoice {} – status updated but GL entry not created",
                        updated.getInvoiceNumber(), e);
                throw e; // re-throw so the transaction rolls back to keep consistency
            }
        }

        return toResponse(updated);
    }

    private String generateInvoiceNumber(Invoice.InvoiceEntity entity) {
        String entityCode = switch (entity) {
            case AUSTRALIA -> "AU";
            case USA -> "US";
            case JAPAN -> "JP";
        };

        return documentNumberGenerator.generate(
                "INV-" + entityCode,
                candidate -> invoiceRepository.findByInvoiceNumberAndIsDeletedFalse(candidate).isPresent()
        );
    }

    public InvoiceResponse toResponse(Invoice invoice) {
        return InvoiceResponse.builder()
                .id(invoice.getId())
                .invoiceNumber(invoice.getInvoiceNumber())
                .soId(invoice.getSoId())
                .poId(invoice.getPoId())
                .accountId(invoice.getAccountId())
                .entity(invoice.getEntity())
                .type(invoice.getType())
                .status(invoice.getStatus())
                .issueDate(invoice.getIssueDate())
                .dueDate(invoice.getDueDate())
                .currency(invoice.getCurrency())
                .subtotal(invoice.getSubtotal())
                .taxAmount(invoice.getTaxAmount())
                .totalAmount(invoice.getTotalAmount())
                .paidAmount(invoice.getPaidAmount())
                .pdfUrl(invoice.getPdfUrl())
                .notes(invoice.getNotes())
                .createdAt(invoice.getCreatedAt().toLocalDateTime())
                .updatedAt(invoice.getUpdatedAt().toLocalDateTime())
                .build();
    }
}
