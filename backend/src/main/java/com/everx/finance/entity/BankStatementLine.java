package com.everx.finance.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "bank_statement_lines")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BankStatementLine {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "statement_id", nullable = false)
    private BankStatement statement;

    @Column(nullable = false)
    private LocalDate transactionDate;

    @Column(nullable = false)
    private String reference;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false, precision = 20, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    private TransactionType transactionType; // DEBIT, CREDIT

    @Column(precision = 20, scale = 2)
    private BigDecimal runningBalance;

    @Column(length = 500)
    private String bankTransactionId; // External bank reference

    @Enumerated(EnumType.STRING)
    private MatchStatus matchStatus; // UNMATCHED, MATCHED, EXCEPTION

    private Long matchedJournalLineId; // Reference to GL entry

    public enum TransactionType {
        DEBIT,
        CREDIT
    }

    public enum MatchStatus {
        UNMATCHED,
        MATCHED,
        EXCEPTION
    }
}
