package com.everx.finance.journal;

import com.everx.shared.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GlPostingService {

    private final GlJournalEntryRepository glJournalEntryRepository;

    /**
     * Creates a GL journal entry for goods receipt (inventory increase)
     * Debit: Inventory (asset)
     * Credit: Accounts Payable (liability)
     */
    @Transactional
    public GlJournalEntry postGoodsReceipt(
            UUID referenceId,
            String referenceNumber,
            BigDecimal amount,
            String currency,
            String entity,
            String description
    ) {
        validatePostingParameters(amount, currency);

        GlJournalEntry entry = new GlJournalEntry();
        entry.setEntity(entity);
        entry.setJournalSource("GOODS_RECEIPT");
        entry.setRefDocumentId(referenceId.toString());
        entry.setDebitAccountCode("1200"); // Inventory
        entry.setCreditAccountCode("2000"); // Accounts Payable
        entry.setDebitAmount(amount);
        entry.setCreditAmount(amount);
        entry.setCurrency(currency);
        entry.setDescription(description + " (" + referenceNumber + ")");
        entry.setJournalDate(OffsetDateTime.now());
        entry.setStatus("AUTO_GENERATED");

        return glJournalEntryRepository.save(entry);
    }

    /**
     * Creates a GL journal entry for reimbursement expense
     * Debit: Expense account (based on category)
     * Credit: Cash/Accounts Payable
     */
    @Transactional
    public GlJournalEntry postReimbursementExpense(
            UUID referenceId,
            String referenceNumber,
            BigDecimal amount,
            String currency,
            String category,
            String description
    ) {
        validatePostingParameters(amount, currency);

        // Map reimbursement category to expense account
        String expenseAccount = mapCategoryToExpenseAccount(category);

        GlJournalEntry entry = new GlJournalEntry();
        entry.setJournalSource("REIMBURSEMENT");
        entry.setRefDocumentId(referenceId.toString());
        entry.setDebitAccountCode(expenseAccount); // Expense
        entry.setCreditAccountCode("1000"); // Cash/Bank
        entry.setDebitAmount(amount);
        entry.setCreditAmount(amount);
        entry.setCurrency(currency);
        entry.setDescription(description + " (" + referenceNumber + ")");
        entry.setJournalDate(OffsetDateTime.now());
        entry.setStatus("AUTO_GENERATED");

        return glJournalEntryRepository.save(entry);
    }

    /**
     * Creates a GL journal entry for invoice payment
     * Debit: Accounts Payable
     * Credit: Cash/Bank
     */
    @Transactional
    public GlJournalEntry postInvoicePayment(
            UUID referenceId,
            String referenceNumber,
            BigDecimal amount,
            String currency,
            String description
    ) {
        validatePostingParameters(amount, currency);

        GlJournalEntry entry = new GlJournalEntry();
        entry.setJournalSource("INVOICE_PAYMENT");
        entry.setRefDocumentId(referenceId.toString());
        entry.setDebitAccountCode("2000"); // Accounts Payable
        entry.setCreditAccountCode("1000"); // Cash/Bank
        entry.setDebitAmount(amount);
        entry.setCreditAmount(amount);
        entry.setCurrency(currency);
        entry.setDescription(description + " (" + referenceNumber + ")");
        entry.setJournalDate(OffsetDateTime.now());
        entry.setStatus("AUTO_GENERATED");

        return glJournalEntryRepository.save(entry);
    }

    private void validatePostingParameters(BigDecimal amount, String currency) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ValidationException("amount", "Amount must be greater than zero");
        }
        if (currency == null || currency.trim().isEmpty()) {
            throw new ValidationException("currency", "Currency is required");
        }
    }

    public String mapCategoryToExpenseAccount(String category) {
        if (category == null) return "6000"; // General expenses

        switch (category.toLowerCase()) {
            case "travel":
                return "6100"; // Travel expenses
            case "meals":
            case "entertainment":
                return "6200"; // Meals & entertainment
            case "office supplies":
                return "6300"; // Office supplies
            case "training":
                return "6400"; // Training & development
            case "medical":
                return "6500"; // Medical expenses
            case "utilities":
                return "6600"; // Utilities
            case "professional services":
                return "6700"; // Professional services
            default:
                return "6000"; // General expenses
        }
    }
}