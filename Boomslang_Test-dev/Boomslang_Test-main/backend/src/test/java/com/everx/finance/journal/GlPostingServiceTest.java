package com.everx.finance.journal;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class GlPostingServiceTest {

    @Autowired
    private GlPostingService glPostingService;

    @Autowired
    private GlJournalEntryRepository glJournalEntryRepository;

    @Test
    void shouldPostGoodsReceiptToGL() {
        // Given
        UUID referenceId = UUID.randomUUID();
        String referenceNumber = "PO-001";
        BigDecimal amount = new BigDecimal("1000.00");
        String currency = "AUD";
        String entity = "AU";
        String description = "Goods receipt for PO-001";

        // When
        GlJournalEntry entry = glPostingService.postGoodsReceipt(
            referenceId, referenceNumber, amount, currency, entity, description
        );

        // Then
        assertThat(entry).isNotNull();
        assertThat(entry.getJournalSource()).isEqualTo("GOODS_RECEIPT");
        assertThat(entry.getRefDocumentId()).isEqualTo(referenceId.toString());
        assertThat(entry.getDebitAccountCode()).isEqualTo("1200"); // Inventory
        assertThat(entry.getCreditAccountCode()).isEqualTo("2000"); // AP
        assertThat(entry.getDebitAmount()).isEqualTo(amount);
        assertThat(entry.getCreditAmount()).isEqualTo(amount);
        assertThat(entry.getCurrency()).isEqualTo(currency);
        assertThat(entry.getDescription()).contains(description);
        assertThat(entry.getStatus()).isEqualTo("AUTO_GENERATED");
    }

    @Test
    void shouldPostReimbursementExpenseToGL() {
        // Given
        UUID referenceId = UUID.randomUUID();
        String referenceNumber = "RMB-123";
        BigDecimal amount = new BigDecimal("250.00");
        String currency = "AUD";
        String category = "travel";
        String description = "Business travel reimbursement";

        // When
        GlJournalEntry entry = glPostingService.postReimbursementExpense(
            referenceId, referenceNumber, amount, currency, category, description
        );

        // Then
        assertThat(entry).isNotNull();
        assertThat(entry.getJournalSource()).isEqualTo("REIMBURSEMENT");
        assertThat(entry.getRefDocumentId()).isEqualTo(referenceId.toString());
        assertThat(entry.getDebitAccountCode()).isEqualTo("6100"); // Travel expenses
        assertThat(entry.getCreditAccountCode()).isEqualTo("1000"); // Cash
        assertThat(entry.getDebitAmount()).isEqualTo(amount);
        assertThat(entry.getCreditAmount()).isEqualTo(amount);
        assertThat(entry.getCurrency()).isEqualTo(currency);
        assertThat(entry.getDescription()).contains(description);
    }

    @Test
    void shouldPostInvoicePaymentToGL() {
        // Given
        UUID referenceId = UUID.randomUUID();
        String referenceNumber = "PAY-456";
        BigDecimal amount = new BigDecimal("500.00");
        String currency = "USD";
        String description = "Payment for invoice INV-001";

        // When
        GlJournalEntry entry = glPostingService.postInvoicePayment(
            referenceId, referenceNumber, amount, currency, description
        );

        // Then
        assertThat(entry).isNotNull();
        assertThat(entry.getJournalSource()).isEqualTo("INVOICE_PAYMENT");
        assertThat(entry.getRefDocumentId()).isEqualTo(referenceId.toString());
        assertThat(entry.getDebitAccountCode()).isEqualTo("2000"); // AP
        assertThat(entry.getCreditAccountCode()).isEqualTo("1000"); // Cash
        assertThat(entry.getDebitAmount()).isEqualTo(amount);
        assertThat(entry.getCreditAmount()).isEqualTo(amount);
        assertThat(entry.getCurrency()).isEqualTo(currency);
        assertThat(entry.getDescription()).contains(description);
    }

    @Test
    void shouldMapReimbursementCategoriesToCorrectExpenseAccounts() {
        // Test various categories map to correct accounts
        assertThat(glPostingService.mapCategoryToExpenseAccount("travel")).isEqualTo("6100");
        assertThat(glPostingService.mapCategoryToExpenseAccount("meals")).isEqualTo("6200");
        assertThat(glPostingService.mapCategoryToExpenseAccount("training")).isEqualTo("6400");
        assertThat(glPostingService.mapCategoryToExpenseAccount("unknown")).isEqualTo("6000");
        assertThat(glPostingService.mapCategoryToExpenseAccount(null)).isEqualTo("6000");
    }
}