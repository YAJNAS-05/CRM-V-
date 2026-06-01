package com.everx.finance.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "bank_statements")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BankStatement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "bank_account_id", nullable = false)
    private BankAccount bankAccount;

    @Column(nullable = false)
    private LocalDate statementDate;

    @Column(nullable = false)
    private LocalDate statementPeriodStart;

    @Column(nullable = false)
    private LocalDate statementPeriodEnd;

    @Column(nullable = false, precision = 20, scale = 2)
    private BigDecimal openingBalance;

    @Column(nullable = false, precision = 20, scale = 2)
    private BigDecimal closingBalance;

    @Column(nullable = false)
    private Integer transactionCount;

    @Enumerated(EnumType.STRING)
    private StatementStatus status; // PENDING, RECONCILED, EXCEPTION

    @Column(nullable = false)
    private LocalDate createdDate;

    @Column(nullable = false)
    private String createdBy;

    public enum StatementStatus {
        PENDING,
        RECONCILED,
        EXCEPTION
    }
}
