package com.everx.finance.posting;

import com.everx.finance.invoice.Invoice;
import com.everx.finance.journal.GlJournalEntry;
import com.everx.finance.journal.GlJournalEntryRepository;
import com.everx.finance.payment.Payment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Canonical double-entry GL posting engine.
 *
 * <p>All accounting events (AR invoices, AR payments, AP accruals) must route
 * through this service so that every debit has a matching credit and all
 * entries are traceable to their source document via {@code batchId} and
 * {@code refDocumentId}.
 *
 * <p>Chart-of-accounts codes used:
 * <ul>
 *   <li>1100 – Accounts Receivable (asset)</li>
 *   <li>4000 – Revenue (income)</li>
 *   <li>1000 – Cash / Bank (asset)</li>
 *   <li>2100 – Accounts Payable (liability)</li>
 *   <li>5000 – COGS / Expense</li>
 *   <li>6900 – FX Gain/Loss (income/expense)</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GlPostingService {

    private final GlJournalEntryRepository glJournalEntryRepository;

    // -------------------------------------------------------------------------
    // AR Invoice posting  DR 1100 / CR 4000
    // -------------------------------------------------------------------------

    /**
     * Post an AR invoice to the GL.
     * Creates two lines:
     * <ol>
     *   <li>DR Accounts Receivable (1100)</li>
     *   <li>CR Revenue (4000)</li>
     * </ol>
     *
     * @param invoice the persisted invoice (must not be DRAFT)
     * @param source  caller label used in description, e.g. "AR_INVOICE"
     */
    @Transactional(propagation = Propagation.REQUIRED)
    public void postInvoiceToGL(Invoice invoice, String source) {
        String batchId = "AR-" + invoice.getInvoiceNumber();
        LocalDate postingDate = invoice.getIssueDate();
        OffsetDateTime now = OffsetDateTime.now();
        String entity = invoice.getEntity().name();

        // Line 1 – Debit AR
        GlJournalEntry debitLine = GlJournalEntry.builder()
                .entity(entity)
                .journalSource(source)
                .refDocumentId(invoice.getInvoiceNumber())
                .batchId(batchId)
                .lineNumber(1)
                .debitAccountCode("1100")
                .creditAccountCode(null)
                .debitAmount(invoice.getTotalAmount())
                .creditAmount(BigDecimal.ZERO)
                .currency(invoice.getCurrency())
                .postingDate(postingDate)
                .journalDate(now)
                .description("AR Invoice " + invoice.getInvoiceNumber() + " – receivable")
                .status("POSTED")
                .build();

        // Line 2 – Credit Revenue
        GlJournalEntry creditLine = GlJournalEntry.builder()
                .entity(entity)
                .journalSource(source)
                .refDocumentId(invoice.getInvoiceNumber())
                .batchId(batchId)
                .lineNumber(2)
                .debitAccountCode(null)
                .creditAccountCode("4000")
                .debitAmount(BigDecimal.ZERO)
                .creditAmount(invoice.getTotalAmount())
                .currency(invoice.getCurrency())
                .postingDate(postingDate)
                .journalDate(now)
                .description("AR Invoice " + invoice.getInvoiceNumber() + " – revenue recognition")
                .status("POSTED")
                .build();

        glJournalEntryRepository.save(debitLine);
        glJournalEntryRepository.save(creditLine);

        log.info("GL posted AR invoice {} batchId={} amount={} {}",
                invoice.getInvoiceNumber(), batchId, invoice.getTotalAmount(), invoice.getCurrency());
    }

    // -------------------------------------------------------------------------
    // AR Payment posting  DR 1000 / CR 1100  (+ optional FX line)
    // -------------------------------------------------------------------------

    /**
     * Post an AR payment to the GL.
     * Creates:
     * <ol>
     *   <li>DR Cash (1000)</li>
     *   <li>CR Accounts Receivable (1100)</li>
     * </ol>
     * FX gain/loss lines are handled by {@link #postFxGainLoss}.
     *
     * @param payment the persisted payment entity
     * @param invoice the parent invoice (needed for entity and invoice number)
     */
    @Transactional(propagation = Propagation.REQUIRED)
    public void postPaymentToGL(Payment payment, Invoice invoice) {
        String batchId = "PMT-" + payment.getId();
        LocalDate postingDate = payment.getPaymentDate();
        OffsetDateTime now = OffsetDateTime.now();
        String entity = invoice.getEntity().name();

        GlJournalEntry debitLine = GlJournalEntry.builder()
                .entity(entity)
                .journalSource("AR_PAYMENT")
                .refDocumentId(payment.getId().toString())
                .batchId(batchId)
                .lineNumber(1)
                .debitAccountCode("1000")
                .creditAccountCode(null)
                .debitAmount(payment.getAmount())
                .creditAmount(BigDecimal.ZERO)
                .currency(payment.getCurrency())
                .exchangeRate(payment.getExchangeRate())
                .functionalAmount(payment.getAudEquivalent())
                .postingDate(postingDate)
                .journalDate(now)
                .description("Payment for invoice " + invoice.getInvoiceNumber())
                .status("POSTED")
                .build();

        GlJournalEntry creditLine = GlJournalEntry.builder()
                .entity(entity)
                .journalSource("AR_PAYMENT")
                .refDocumentId(payment.getId().toString())
                .batchId(batchId)
                .lineNumber(2)
                .debitAccountCode(null)
                .creditAccountCode("1100")
                .debitAmount(BigDecimal.ZERO)
                .creditAmount(payment.getAmount())
                .currency(payment.getCurrency())
                .exchangeRate(payment.getExchangeRate())
                .functionalAmount(payment.getAudEquivalent())
                .postingDate(postingDate)
                .journalDate(now)
                .description("Clear AR for invoice " + invoice.getInvoiceNumber())
                .status("POSTED")
                .build();

        glJournalEntryRepository.save(debitLine);
        glJournalEntryRepository.save(creditLine);

        log.info("GL posted AR payment {} batchId={} amount={} {}",
                payment.getId(), batchId, payment.getAmount(), payment.getCurrency());
    }

    // -------------------------------------------------------------------------
    // FX Gain/Loss posting  DR/CR 6900
    // -------------------------------------------------------------------------

    /**
     * Post a realised FX gain or loss entry.
     * A positive {@code fxGainLoss} is a <em>gain</em> (CR 6900), negative is a
     * <em>loss</em> (DR 6900).
     *
     * @param refPaymentId source payment UUID
     * @param fxGainLoss   signed gain/loss amount in functional currency
     * @param currency     functional currency code (e.g. "AUD")
     * @param postingDate  business date
     * @param entity       legal entity name
     */
    @Transactional(propagation = Propagation.REQUIRED)
    public void postFxGainLoss(UUID refPaymentId, BigDecimal fxGainLoss,
                               String currency, LocalDate postingDate, String entity) {
        if (fxGainLoss == null || fxGainLoss.compareTo(BigDecimal.ZERO) == 0) {
            return;
        }

        boolean isGain = fxGainLoss.compareTo(BigDecimal.ZERO) > 0;
        BigDecimal absAmount = fxGainLoss.abs();
        String batchId = "FX-" + refPaymentId;
        OffsetDateTime now = OffsetDateTime.now();

        GlJournalEntry entry = GlJournalEntry.builder()
                .entity(entity)
                .journalSource("FX_REVAL")
                .refDocumentId(refPaymentId.toString())
                .batchId(batchId)
                .lineNumber(1)
                .debitAccountCode(isGain ? null : "6900")
                .creditAccountCode(isGain ? "6900" : null)
                .debitAmount(isGain ? BigDecimal.ZERO : absAmount)
                .creditAmount(isGain ? absAmount : BigDecimal.ZERO)
                .currency(currency)
                .postingDate(postingDate)
                .journalDate(now)
                .description("Realised FX " + (isGain ? "gain" : "loss") + " on payment " + refPaymentId)
                .status("POSTED")
                .build();

        glJournalEntryRepository.save(entry);

        log.info("GL posted FX {} batchId={} amount={} {}",
                isGain ? "gain" : "loss", batchId, absAmount, currency);
    }

    // -------------------------------------------------------------------------
    // AP Accrual posting  DR 5000 / CR 2100
    // -------------------------------------------------------------------------

    /**
     * Post an AP accrual (GR/IR) when a purchase-order receipt is recorded.
     *
     * @param refPoReceiptId  PO receipt document ID (used as refDocumentId)
     * @param amount          accrual amount in document currency
     * @param currency        document currency code
     * @param postingDate     business date of the receipt
     * @param entity          legal entity name
     */
    @Transactional(propagation = Propagation.REQUIRED)
    public void postApAccrual(String refPoReceiptId, BigDecimal amount,
                              String currency, LocalDate postingDate, String entity) {
        String batchId = "AP-" + refPoReceiptId;
        OffsetDateTime now = OffsetDateTime.now();

        GlJournalEntry debitLine = GlJournalEntry.builder()
                .entity(entity)
                .journalSource("AP_ACCRUAL")
                .refDocumentId(refPoReceiptId)
                .batchId(batchId)
                .lineNumber(1)
                .debitAccountCode("5000")
                .creditAccountCode(null)
                .debitAmount(amount)
                .creditAmount(BigDecimal.ZERO)
                .currency(currency)
                .postingDate(postingDate)
                .journalDate(now)
                .description("AP accrual for PO receipt " + refPoReceiptId)
                .status("POSTED")
                .build();

        GlJournalEntry creditLine = GlJournalEntry.builder()
                .entity(entity)
                .journalSource("AP_ACCRUAL")
                .refDocumentId(refPoReceiptId)
                .batchId(batchId)
                .lineNumber(2)
                .debitAccountCode(null)
                .creditAccountCode("2100")
                .debitAmount(BigDecimal.ZERO)
                .creditAmount(amount)
                .currency(currency)
                .postingDate(postingDate)
                .journalDate(now)
                .description("AP accrual liability for PO receipt " + refPoReceiptId)
                .status("POSTED")
                .build();

        glJournalEntryRepository.save(debitLine);
        glJournalEntryRepository.save(creditLine);

        log.info("GL posted AP accrual batchId={} amount={} {}", batchId, amount, currency);
    }

    // -------------------------------------------------------------------------
    // Reversal
    // -------------------------------------------------------------------------

    /**
     * Reverse a previously posted GL entry by creating equal-and-opposite lines
     * and marking the original as REVERSED.
     *
     * @param original      the entry to reverse
     * @param reason        free-text reason for the reversal
     * @param reversalDate  business date of the reversal
     */
    @Transactional(propagation = Propagation.REQUIRED)
    public void reverseEntry(GlJournalEntry original, String reason, LocalDate reversalDate) {
        String batchId = "REV-" + original.getBatchId();
        OffsetDateTime now = OffsetDateTime.now();

        GlJournalEntry reversal = GlJournalEntry.builder()
                .entity(original.getEntity())
                .journalSource("REVERSAL")
                .refDocumentId(original.getRefDocumentId())
                .batchId(batchId)
                .lineNumber(original.getLineNumber())
                .debitAccountCode(original.getCreditAccountCode())   // swap debit/credit
                .creditAccountCode(original.getDebitAccountCode())
                .debitAmount(original.getCreditAmount())
                .creditAmount(original.getDebitAmount())
                .currency(original.getCurrency())
                .functionalAmount(original.getFunctionalAmount())
                .exchangeRate(original.getExchangeRate())
                .postingDate(reversalDate)
                .journalDate(now)
                .description("Reversal of batch " + original.getBatchId() + " – " + reason)
                .reversalOfId(original.getId())
                .reversalReason(reason)
                .status("POSTED")
                .build();

        glJournalEntryRepository.save(reversal);

        // Mark original as reversed
        original.setStatus("REVERSED");
        original.setReversalReason(reason);
        glJournalEntryRepository.save(original);

        log.info("GL reversed entry id={} batchId={} reason={}", original.getId(), batchId, reason);
    }
}
