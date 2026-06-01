package com.everx.finance.entity;

import com.everx.finance.account.entity.GlAccount;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "budget_lines", schema = "everx_finance")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetLine extends AuditEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "budget_id", nullable = false)
    private Budget budget;

    @ManyToOne
    @JoinColumn(name = "account_id", nullable = false)
    private GlAccount account;

    @Column(name = "budgeted_amount", nullable = false, precision = 20, scale = 2)
    private BigDecimal budgetedAmount;

    @Column(name = "budget_month", nullable = false, length = 20)
    private String budgetMonth; // e.g., "2026-01", "2026-02"

    @Version
    private Long version;

    @Override
    public String toString() {
        return "BudgetLine{" +
                "id=" + id +
                ", budget=" + budget.getId() +
                ", account=" + account.getAccountCode() +
                ", budgetedAmount=" + budgetedAmount +
                ", budgetMonth='" + budgetMonth + '\'' +
                '}';
    }
}
