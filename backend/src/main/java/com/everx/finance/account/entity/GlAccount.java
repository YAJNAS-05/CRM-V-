package com.everx.finance.account.entity;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Chart of Accounts Entity - Hierarchical GL Account Structure
 * Supports parent-child relationships for multi-level account hierarchy.
 */
@Entity
@Table(name = "gl_accounts", schema = "everx_finance", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"account_code", "company_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GlAccount extends BaseEntity {

    @Column(nullable = false, length = 50)
    private String accountCode;

    @Column(nullable = false, length = 255)
    private String accountName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private AccountType accountType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_account_id", foreignKey = @ForeignKey(name = "fk_gl_accounts_parent"))
    private GlAccount parentAccount;

    @OneToMany(mappedBy = "parentAccount", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GlAccount> childAccounts = new ArrayList<>();

    @Column(nullable = false)
    private UUID companyId;

    @Column(nullable = false)
    private Integer level;

    @Column(nullable = false)
    private Boolean isActive = true;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private NormalBalance normalBalance;

    @Column(nullable = false)
    private Boolean requiresCostCenter = false;

    @Column(nullable = false)
    private Boolean requiresDepartment = false;

    @Column(nullable = false)
    private Boolean allowsManualEntry = false;

    @Transient
    private java.math.BigDecimal balance;

    /**
     * Validates hierarchy constraints before persistence
     */
    @PrePersist
    @PreUpdate
    private void validateHierarchy() {
        if (parentAccount != null && level != parentAccount.getLevel() + 1) {
            throw new IllegalArgumentException(
                String.format("Account level must be parent.level + 1. Parent level: %d, Current level: %d",
                    parentAccount.getLevel(), level)
            );
        }
        
        if (level > 5) {
            throw new IllegalArgumentException("Account hierarchy depth cannot exceed 5 levels");
        }
    }

    /**
     * Account Types Enum
     */
    public enum AccountType {
        ASSET,
        LIABILITY,
        EQUITY,
        REVENUE,
        EXPENSE,
        COST_OF_SALES
    }

    /**
     * Normal Balance Enum (DEBIT or CREDIT)
     */
    public enum NormalBalance {
        DEBIT,
        CREDIT;

        public static NormalBalance fromAccountType(AccountType type) {
            return switch (type) {
                case ASSET, EXPENSE, COST_OF_SALES -> DEBIT;
                case LIABILITY, EQUITY, REVENUE -> CREDIT;
            };
        }
    }
}
