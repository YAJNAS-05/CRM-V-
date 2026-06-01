package com.everx.finance.journal.entity;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Journal Entry - Master record for GL postings with approval workflow
 */
@Entity
@Table(name = "journal_entries", schema = "everx_finance",
       indexes = {
           @Index(name = "idx_je_posting_period", columnList = "posting_period_id"),
           @Index(name = "idx_je_company", columnList = "company_id"),
           @Index(name = "idx_je_status", columnList = "status"),
           @Index(name = "idx_je_posting_date", columnList = "posting_date")
       })
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JournalEntry extends BaseEntity {

    @Column(nullable = false, unique = true, length = 50)
    private String entryNumber;

    @Column(nullable = false)
    private LocalDate entryDate;

    @Column(nullable = false)
    private LocalDate postingDate;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "posting_period_id", nullable = false, 
                foreignKey = @ForeignKey(name = "fk_je_posting_period"))
    private PostingPeriod postingPeriod;

    @Column(nullable = false)
    private UUID companyId;

    @Column(length = 100)
    private String reference;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Status status = Status.DRAFT;

    @Column(name = "department_id")
    private UUID departmentId;

    @Column(name = "approved_by")
    private UUID approvedBy;

    @Column(name = "approved_at")
    private OffsetDateTime approvedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reversal_of_id", foreignKey = @ForeignKey(name = "fk_je_reversal_of"))
    private JournalEntry reversalOf;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @OneToMany(mappedBy = "journalEntry", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<JournalEntryLine> journalEntryLines = new ArrayList<>();

    /**
     * Validates that debit lines total equals credit lines total
     */
    public boolean isBalanced() {
        java.math.BigDecimal totalDebits = journalEntryLines.stream()
            .map(JournalEntryLine::getDebitAmount)
            .filter(java.util.Objects::nonNull)
            .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

        java.math.BigDecimal totalCredits = journalEntryLines.stream()
            .map(JournalEntryLine::getCreditAmount)
            .filter(java.util.Objects::nonNull)
            .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

        return totalDebits.compareTo(totalCredits) == 0;
    }

    public enum Status {
        DRAFT,
        POSTED,
        REVERSED,
        VOID
    }
}
