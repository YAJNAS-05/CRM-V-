package com.everx.finance.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "bank_reconciliations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BankReconciliation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "bank_account_id", nullable = false)
    private BankAccount bankAccount;

    @ManyToOne
    @JoinColumn(name = "statement_id", nullable = false)
    private BankStatement statement;

    @Column(nullable = false)
    private LocalDate reconciliationDate;

    @Column(nullable = false, precision = 20, scale = 2)
    private BigDecimal glBalance;

    @Column(nullable = false, precision = 20, scale = 2)
    private BigDecimal bankBalance;

    @Column(precision = 20, scale = 2)
    private BigDecimal difference;

    @Enumerated(EnumType.STRING)
    private ReconciliationStatus status; // IN_PROGRESS, RECONCILED, EXCEPTION

    @Column(length = 1000)
    private String notes;

    private Integer matchedCount;
    private Integer unmatchedCount;

    @Column(nullable = false)
    private LocalDate createdDate;

    @Column(nullable = false)
    private String createdBy;

    private LocalDate approvedDate;
    private String approvedBy;

    public enum ReconciliationStatus {
        IN_PROGRESS,
        RECONCILED,
        EXCEPTION
    }
}
