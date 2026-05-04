package com.everx.finance.close;

import com.everx.erp.purchaseorder.PurchaseReceipt;
import com.everx.erp.purchaseorder.PurchaseReceiptRepository;
import com.everx.finance.close.dto.ThreeWayMatchExceptionDto;
import com.everx.finance.fx.FxRateHistoryService;
import com.everx.finance.invoice.Invoice;
import com.everx.finance.invoice.InvoiceRepository;
import com.everx.finance.journal.GlJournalEntry;
import com.everx.finance.journal.GlJournalEntryRepository;
import com.everx.finance.period.PostingPeriodService;
import com.everx.finance.consolidation.IntercompanyEliminationService;
import com.everx.finance.tolerance.ThreeWayMatchResult;
import com.everx.finance.tolerance.ThreeWayMatchService;
import com.everx.shared.exception.EntityNotFoundException;
import com.everx.shared.exception.ValidationException;
import com.everx.shared.util.SecurityUserContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class FinancialCloseService {

    private static final String BASE_CURRENCY = "AUD";

    private final ThreeWayMatchService threeWayMatchService;
    private final ThreeWayMatchExceptionRepository exceptionRepository;
    private final InvoiceRepository invoiceRepository;
    private final PurchaseReceiptRepository purchaseReceiptRepository;
    private final FxRateHistoryService fxRateHistoryService;
    private final GlJournalEntryRepository glJournalEntryRepository;
    private final IntercompanyEliminationService intercompanyEliminationService;
    private final PostingPeriodService postingPeriodService;

    public void initiateMonthEndClose(LocalDate periodEnd) {
        performThreeWayMatch(periodEnd);
        calculateFxRevaluation(periodEnd);
        generateAccrualJournals(periodEnd);
        consolidateMultiEntity(periodEnd);
    }

    @Transactional(readOnly = true)
    public List<ThreeWayMatchExceptionDto> getExceptions(LocalDate periodEnd) {
        return exceptionRepository.findByPeriodEndAndIsDeletedFalse(periodEnd).stream()
                .map(ThreeWayMatchExceptionDto::fromEntity)
                .toList();
    }

    public void resolveException(UUID exceptionId, String action, String notes) {
        ThreeWayMatchException exception = exceptionRepository.findById(exceptionId)
                .orElseThrow(() -> new EntityNotFoundException("Match exception not found with id: " + exceptionId));

        exception.setStatus(action != null ? action : "RESOLVED");
        exception.setNotes(notes);
        exception.setResolvedBy(SecurityUserContext.getCurrentUserIdOrNull());
        exception.setResolvedAt(OffsetDateTime.now());
        exceptionRepository.save(exception);
    }

    public void closePostingPeriod(String companyCode, LocalDate periodEnd) {
        String closedBy = String.valueOf(SecurityUserContext.getCurrentUserIdOrNull());
        postingPeriodService.closePeriod(companyCode, periodEnd.getYear(), periodEnd.getMonthValue(), closedBy);
    }

    private void performThreeWayMatch(LocalDate periodEnd) {
        List<Invoice> invoices = invoiceRepository.findByIssueDateLessThanEqual(periodEnd);
        for (Invoice invoice : invoices) {
            if (invoice.getPoId() == null) {
                continue;
            }

            if (exceptionRepository.findByInvoiceIdAndStatusAndIsDeletedFalse(invoice.getId(), "OPEN").isPresent()) {
                continue;
            }

            try {
                ThreeWayMatchResult result = threeWayMatchService.matchPoReceiptInvoice(invoice.getPoId());
                if (result.isMatched()) {
                    invoice.setThreeWayMatched(true);
                    invoiceRepository.save(invoice);
                    continue;
                }

                createException(invoice, result.getVarianceReason(), result.getVarianceAmount(), periodEnd);
            } catch (ValidationException ex) {
                ThreeWayMatchException exception = createException(invoice, "DATA_MISSING", null, periodEnd);
                exception.setNotes(ex.getMessage());
                exceptionRepository.save(exception);
            }
        }
    }

    private ThreeWayMatchException createException(Invoice invoice, String exceptionType, BigDecimal varianceAmount, LocalDate periodEnd) {
        PurchaseReceipt receipt = purchaseReceiptRepository.findTopByPoIdOrderByReceivedDateDesc(invoice.getPoId())
                .orElse(null);

        ThreeWayMatchException exception = new ThreeWayMatchException();
        exception.setPoId(invoice.getPoId());
        exception.setInvoiceId(invoice.getId());
        exception.setReceiptId(receipt != null ? receipt.getId() : null);
        exception.setExceptionType(exceptionType != null ? exceptionType : "UNMATCHED");
        exception.setVarianceAmount(varianceAmount);
        exception.setStatus("OPEN");
        exception.setPeriodEnd(periodEnd);
        return exceptionRepository.save(exception);
    }

    private void calculateFxRevaluation(LocalDate periodEnd) {
        List<Invoice> invoices = invoiceRepository.findByIssueDateLessThanEqualAndCurrencyNot(periodEnd, BASE_CURRENCY);
        for (Invoice invoice : invoices) {
            if (invoice.getIssueDate() == null || invoice.getCurrency() == null || invoice.getTotalAmount() == null) {
                continue;
            }

            BigDecimal fxGainLoss = fxRateHistoryService.calculateFxGainLoss(
                    invoice.getTotalAmount(), invoice.getCurrency(), BASE_CURRENCY, invoice.getIssueDate());

            if (fxGainLoss.compareTo(BigDecimal.ZERO) == 0) {
                continue;
            }

            BigDecimal amount = fxGainLoss.abs().setScale(2, RoundingMode.HALF_UP);
            String debitAccount = fxGainLoss.signum() >= 0 ? "1200" : "8000";
            String creditAccount = fxGainLoss.signum() >= 0 ? "8000" : "1200";

            GlJournalEntry entry = new GlJournalEntry();
            entry.setEntity(invoice.getEntity() != null ? invoice.getEntity().name() : null);
            entry.setJournalSource("FX_REVALUATION");
            entry.setRefDocumentId(invoice.getId().toString());
            entry.setDebitAccountCode(debitAccount);
            entry.setCreditAccountCode(creditAccount);
            entry.setDebitAmount(amount);
            entry.setCreditAmount(amount);
            entry.setCurrency(invoice.getCurrency());
            entry.setDescription("FX revaluation for invoice " + invoice.getInvoiceNumber());
            entry.setJournalDate(periodEnd.atStartOfDay().atOffset(ZoneOffset.UTC));
            entry.setStatus("AUTO_GENERATED");
            glJournalEntryRepository.save(entry);
        }
    }

    private void generateAccrualJournals(LocalDate periodEnd) {
        LocalDate periodStart = periodEnd.withDayOfMonth(1);
        BigDecimal periodSales = invoiceRepository.sumTotalAmountByIssueDateBetween(periodStart, periodEnd);

        BigDecimal warrantyReserve = periodSales.multiply(new BigDecimal("0.05"))
                .setScale(2, RoundingMode.HALF_UP);
        if (warrantyReserve.compareTo(BigDecimal.ZERO) > 0) {
            createJournalEntry("WARRANTY_ACCRUAL", "5210", "2050", warrantyReserve,
                    "Warranty reserve accrual", periodEnd);
        }

        BigDecimal serviceDeferral = periodSales.multiply(new BigDecimal("0.03"))
                .setScale(2, RoundingMode.HALF_UP);
        if (serviceDeferral.compareTo(BigDecimal.ZERO) > 0) {
            createJournalEntry("SERVICE_DEFERRAL", "2045", "4010", serviceDeferral,
                    "Service revenue deferral", periodEnd);
        }
    }

    private void consolidateMultiEntity(LocalDate periodEnd) {
        UUID userId = SecurityUserContext.getCurrentUserIdOrNull();
        intercompanyEliminationService.eliminateIntercompanyTransactions(
                periodEnd.getYear(), periodEnd.getMonthValue(), String.valueOf(userId));
    }

    private void createJournalEntry(String source, String debitAccount, String creditAccount,
                                    BigDecimal amount, String description, LocalDate periodEnd) {
        GlJournalEntry entry = new GlJournalEntry();
        entry.setJournalSource(source);
        entry.setDebitAccountCode(debitAccount);
        entry.setCreditAccountCode(creditAccount);
        entry.setDebitAmount(amount);
        entry.setCreditAmount(amount);
        entry.setCurrency(BASE_CURRENCY);
        entry.setDescription(description);
        entry.setJournalDate(periodEnd.atStartOfDay().atOffset(ZoneOffset.UTC));
        entry.setStatus("AUTO_GENERATED");
        glJournalEntryRepository.save(entry);
    }
}
