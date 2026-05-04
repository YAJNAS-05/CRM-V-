package com.everx.finance.journal;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "gl_journal_entries", schema = "everx_erp")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GlJournalEntry extends BaseEntity {

    @Column(name = "entity", length = 50)
    private String entity;

    @Column(name = "journal_source", nullable = false, length = 50)
    private String journalSource;

    @Column(name = "ref_document_id", length = 50)
    private String refDocumentId;

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

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "journal_date", nullable = false)
    private OffsetDateTime journalDate;

    @Column(name = "status", nullable = false, length = 30)
    private String status = "AUTO_GENERATED";
}
