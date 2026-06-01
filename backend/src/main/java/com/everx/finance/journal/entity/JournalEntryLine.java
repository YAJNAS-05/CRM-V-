package com.everx.finance.journal.entity;

import com.everx.finance.account.entity.GlAccount;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Journal Entry Line - Immutable GL posting detail (debit/credit lines)
 */
@Entity
@Table(name = "journal_entry_lines", schema = "everx_finance",
       indexes = {
           @Index(name = "idx_jel_journal_entry", columnList = "journal_entry_id"),
           @Index(name = "idx_jel_gl_account", columnList = "gl_account_id"),
           @Index(name = "idx_jel_source_doc", columnList = "source_document_type,source_document_id")
       })
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JournalEntryLine {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "journal_entry_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_jel_journal_entry"))
    private JournalEntry journalEntry;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "gl_account_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_jel_gl_account"))
    private GlAccount glAccount;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(precision = 19, scale = 2)
    private BigDecimal debitAmount;

    @Column(precision = 19, scale = 2)
    private BigDecimal creditAmount;

    @Column(name = "cost_center_id")
    private UUID costCenterId;

    @Column(name = "department_id")
    private UUID departmentId;

    @Column(name = "project_id")
    private UUID projectId;

    @Column(length = 50)
    private String sourceDocumentType;

    @Column(name = "source_document_id")
    private UUID sourceDocumentId;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private ReconciliationStatus reconciliationStatus = ReconciliationStatus.UNRECONCILED;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false, updatable = false)
    private UUID createdBy;

    @Version
    private Long version = 0L;

    public enum ReconciliationStatus {
        UNRECONCILED,
        RECONCILED,
        EXCEPTION
    }
}
