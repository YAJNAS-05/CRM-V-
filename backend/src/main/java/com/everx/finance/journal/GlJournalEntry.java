package com.everx.finance.journal;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "gl_journal_entries", schema = "everx_erp")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class GlJournalEntry extends BaseEntity {

    /** Legal entity this entry belongs to (AUSTRALIA, USA, JAPAN) */
    @Column(name = "entity", length = 50)
    private String entity;

    /** Originating subsystem: AR_INVOICE, AR_PAYMENT, AP_ACCRUAL, FX_REVAL, MANUAL */
    @Column(name = "journal_source", nullable = false, length = 50)
    private String journalSource;

    /** Source document ID (invoice number, payment UUID, PO number, etc.) */
    @Column(name = "ref_document_id", length = 100)
    private String refDocumentId;

    /** Batch identifier – groups all lines of one logical posting event */
    @Column(name = "batch_id", length = 100)
    private String batchId;

    /** Sequential line within the batch (1-based) */
    @Column(name = "line_number")
    @Builder.Default
    private Integer lineNumber = 1;

    @Column(name = "debit_account_code", length = 20)
    private String debitAccountCode;

    @Column(name = "credit_account_code", length = 20)
    private String creditAccountCode;

    @Column(name = "debit_amount", precision = 15, scale = 2)
    private BigDecimal debitAmount;

    @Column(name = "credit_amount", precision = 15, scale = 2)
    private BigDecimal creditAmount;

    @Column(name = "currency", length = 3)
    private String currency;

    /** Functional-currency (AUD) equivalent amount */
    @Column(name = "functional_amount", precision = 15, scale = 2)
    private BigDecimal functionalAmount;

    @Column(name = "exchange_rate", precision = 12, scale = 6)
    private BigDecimal exchangeRate;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /** Business date of the transaction (may differ from createdAt) */
    @Column(name = "posting_date", nullable = false)
    private LocalDate postingDate;

    @Column(name = "journal_date", nullable = false)
    private OffsetDateTime journalDate;

    /** POSTED | PENDING_APPROVAL | REVERSED | VOIDED */
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private String status = "POSTED";

    /** UUID of the original entry that this entry reverses */
    @Column(name = "reversal_of_id")
    private UUID reversalOfId;

    /** Free-text reason when status = REVERSED or VOIDED */
    @Column(name = "reversal_reason", length = 255)
    private String reversalReason;
}
