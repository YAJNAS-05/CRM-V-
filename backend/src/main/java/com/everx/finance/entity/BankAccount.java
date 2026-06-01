package com.everx.finance.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "bank_accounts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BankAccount {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String accountNumber;

    @Column(nullable = false)
    private String accountName;

    private String bankName;
    private String accountType; // CHECKING, SAVINGS, MONEY_MARKET

    @Column(nullable = false)
    private String currency;

    @Column(precision = 20, scale = 2)
    private BigDecimal glAccountBalance; // Balance from GL

    @Column(precision = 20, scale = 2)
    private BigDecimal bankStatementBalance; // Balance from bank

    @Column(precision = 20, scale = 2)
    private BigDecimal reconciliationDifference; // Difference to be explained

    private LocalDate lastReconciliationDate;

    @Enumerated(EnumType.STRING)
    private AccountStatus status; // ACTIVE, INACTIVE, ARCHIVED

    @Column(nullable = false)
    private LocalDate createdDate;

    @Column(nullable = false)
    private String createdBy;

    @Version
    private Long version;

    public enum AccountStatus {
        ACTIVE,
        INACTIVE,
        ARCHIVED
    }
}
