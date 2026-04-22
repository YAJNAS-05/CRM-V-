package com.everx.finance.period;

import com.everx.shared.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/**
 * FIX #3: Posting Period Enforcement
 * 
 * Enforces posting period rules at application layer (in addition to DB constraints)
 * Prevents posting transactions to closed fiscal periods
 * 
 * Rules:
 * - OPEN periods: Can create and post documents
 * - LOCKED periods: Cannot post (read-only for analysis)
 * - CLOSED periods: Completely locked (no transactions)
 * 
 * Called before every GL posting operation.
 */
@Component
@RequiredArgsConstructor
public class PostingPeriodEnforcer {

    private final PostingPeriodRepository postingPeriodRepository;

    /**
     * Validates that posting transaction to a specific period is allowed
     */
    public void enforcePostingAllowed(String companyCode, LocalDate transactionDate) {
        int period = transactionDate.getMonthValue();
        int year = transactionDate.getYear();
        PostingPeriod periodRecord = postingPeriodRepository
            .findByCompanyCodeAndFiscalYearAndPeriod(companyCode, year, period)
            .orElseThrow(() -> new ValidationException(
                "No posting period found for " + companyCode +
                " period " + period + "/" + year
            ));

        if (periodRecord.getStatus() == PostingPeriod.PeriodStatus.CLOSED) {
            throw new ValidationException(
                "Posting period is CLOSED for " + period + "/" + year +
                " (" + companyCode + "). Transactions cannot be posted."
            );
        }

        if (periodRecord.getStatus() == PostingPeriod.PeriodStatus.LOCKED) {
            throw new ValidationException(
                "Posting period is LOCKED for " + period + "/" + year +
                " (" + companyCode + "). No new transactions allowed."
            );
        }
    }

    /**
     * Prevents backdating: cannot post to periods more than N days in the past
     * Default: 90 days (configurable)
     */
    public void enforceNoBackdating(LocalDate transactionDate) {
        LocalDate maxBackdateDate = LocalDate.now().minusDays(90);
        
        if (transactionDate.isBefore(maxBackdateDate)) {
            throw new ValidationException(
                "Cannot post transactions more than 90 days in the past. " +
                "Transaction date: " + transactionDate + 
                ". Latest allowed: " + maxBackdateDate
            );
        }
    }

    /**
     * Ensures invoice status is immutable once posted
     * Prevents amendment/deletion of posted invoices
     */
    public void enforceInvoiceImmutability(String invoiceNumber, String currentStatus) {
        if ("PAID".equals(currentStatus) || "PARTIALLY_PAID".equals(currentStatus)
                || "VOID".equals(currentStatus) || "OVERDUE".equals(currentStatus)
                || "CANCELLED".equals(currentStatus)) {
            throw new ValidationException(
                "Invoice " + invoiceNumber + " is immutable (status: " + currentStatus + "). " +
                "Cannot modify. Use Reverse/Credit Note to correct."
            );
        }
    }
}
