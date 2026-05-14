package com.everx.finance.consolidation;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Tracks intercompany transactions for consolidation elimination.
 * Records which transactions have been eliminated to prevent double-counting.
 */
@Entity
@Table(name = "intercompany_transactions", schema = "everx_erp", indexes = {
    @Index(name = "idx_ic_from_to_period", columnList = "from_entity, to_entity, transaction_date"),
    @Index(name = "idx_ic_elimination_status", columnList = "elimination_status, transaction_date")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class IntercompanyTransaction extends BaseEntity {

    /**
     * Elimination status of the transaction
     */
    public enum EliminationStatus {
        PENDING,      // Not yet eliminated
        ELIMINATED,   // Eliminated in consolidation
        REVERSED      // Elimination reversed (correction)
    }

    @Column(name = "from_entity", nullable = false, length = 10)
    private String fromEntity;   // AU01, US01, JP01

    @Column(name = "to_entity", nullable = false, length = 10)
    private String toEntity;     // AU01, US01, JP01

    @Column(name = "source_document_type", nullable = false, length = 50)
    private String sourceDocumentType;  // INVOICE, SO, PO, etc.

    @Column(name = "source_document_id", nullable = false)
    private String sourceDocumentId;    // Document number/ID to link back

    @Column(name = "transaction_amount", nullable = false)
    private BigDecimal transactionAmount;

    @Column(name = "currency", nullable = false, length = 3)
    private String currency;  // USD, AUD, JPY

    @Column(name = "transaction_date", nullable = false)
    private LocalDate transactionDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "elimination_status", nullable = false)
    @Builder.Default
    private EliminationStatus eliminationStatus = EliminationStatus.PENDING;

    @Column(name = "eliminated_by")
    private String eliminatedBy;  // Username of who eliminated

    @Column(name = "eliminated_at")
    private LocalDateTime eliminatedAt;

    @Column(name = "consolidation_period")
    private String consolidationPeriod;  // yyyy-MM format (2026-04)

    @Column(name = "elimination_notes", columnDefinition = "TEXT")
    private String eliminationNotes;
}
