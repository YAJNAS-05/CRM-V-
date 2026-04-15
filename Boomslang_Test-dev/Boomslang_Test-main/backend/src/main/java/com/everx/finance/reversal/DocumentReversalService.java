package com.everx.finance.reversal;

import com.everx.finance.invoice.Invoice;
import com.everx.finance.invoice.InvoiceRepository;
import com.everx.finance.reversal.dto.ReversalRequest;
import com.everx.shared.exception.AccountingImmutabilityException;
import com.everx.shared.exception.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Set;
import java.util.UUID;

/**
 * Service for handling reversal of accounting documents.
 * 
 * Reversals are the only way to correct posted accounting documents.
 * Original document is marked as VOID, and a mirror document with negative amounts
 * is created to maintain an immutable audit trail.
 */
@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class DocumentReversalService {

    private final InvoiceRepository invoiceRepository;

    /**
     * Reverses (voids) an invoice by creating a mirror invoice with negative amounts.
     * Uses REPEATABLE_READ isolation to prevent race conditions during reversal workflows.
     * 
     * @param originalInvoiceId UUID of the invoice to reverse
     * @param request Contains reason code and optional note
     * @return The reversal invoice (mirror of original with negative amounts)
     * @throws EntityNotFoundException if invoice not found
     * @throws AccountingImmutabilityException if invoice cannot be reversed
     */
    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public Invoice reverseInvoice(UUID originalInvoiceId, ReversalRequest request) {
        Invoice original = invoiceRepository.findById(originalInvoiceId)
            .orElseThrow(() -> new EntityNotFoundException("Invoice not found: " + originalInvoiceId));

        // Can only reverse posted invoices (not DRAFT or already VOID)
        Set<Invoice.InvoiceStatus> reversibleStatuses = Set.of(
            Invoice.InvoiceStatus.SENT,
            Invoice.InvoiceStatus.PARTIALLY_PAID,
            Invoice.InvoiceStatus.PAID,
            Invoice.InvoiceStatus.OVERDUE
        );

        if (!reversibleStatuses.contains(original.getStatus())) {
            throw new AccountingImmutabilityException(
                "Cannot reverse invoice " + original.getInvoiceNumber() + ". " +
                "Current status: " + original.getStatus() + ". " +
                "Only SENT, PARTIALLY_PAID, PAID, or OVERDUE invoices can be reversed."
            );
        }

        // Create reversal invoice (mirror with all amounts negated)
        Invoice reversal = Invoice.builder()
            .invoiceNumber(original.getInvoiceNumber() + "-R")  // Add -R suffix to indicate reversal
            .soId(original.getSoId())
            .accountId(original.getAccountId())
            .entity(original.getEntity())
            .type(original.getType())
            .issueDate(LocalDate.now())
            .dueDate(original.getDueDate())
            .currency(original.getCurrency())
            .subtotal(original.getSubtotal() != null ? original.getSubtotal().negate() : BigDecimal.ZERO)
            .taxAmount(original.getTaxAmount() != null ? original.getTaxAmount().negate() : BigDecimal.ZERO)
            .totalAmount(original.getTotalAmount() != null ? original.getTotalAmount().negate() : BigDecimal.ZERO)
            .paidAmount(BigDecimal.ZERO)
            .status(Invoice.InvoiceStatus.VOID)
            .reversalOf(originalInvoiceId)
            .reversalReason(request.getReasonCode() != null ? request.getReasonCode().name() : null)
            .reversalNote(request.getNote())
            .notes("REVERSAL: " + original.getInvoiceNumber() + " | Reason: " + 
                   (request.getReasonCode() != null ? request.getReasonCode().getDescription() : ""))
            .build();

        reversal.setCreatedAt(OffsetDateTime.now());
        reversal.setUpdatedAt(OffsetDateTime.now());

        // Save reversal invoice
        Invoice savedReversal = invoiceRepository.save(reversal);
        log.info("Created reversal invoice {} for original invoice {}", 
                 savedReversal.getInvoiceNumber(), original.getInvoiceNumber());

        // Mark original as VOID and link to reversal
        original.setStatus(Invoice.InvoiceStatus.VOID);
        original.setReversedBy(savedReversal.getInvoiceNumber());
        original.setUpdatedAt(OffsetDateTime.now());
        invoiceRepository.save(original);
        log.info("Marked original invoice {} as VOID", original.getInvoiceNumber());

        return savedReversal;
    }
}
