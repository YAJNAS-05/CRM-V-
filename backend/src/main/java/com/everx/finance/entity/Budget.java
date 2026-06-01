package com.everx.finance.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "budgets", schema = "everx_finance")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Budget extends AuditEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "budget_code", nullable = false, unique = true, length = 50)
    private String budgetCode;

    @Column(name = "budget_name", nullable = false, length = 255)
    private String budgetName;

    @Column(name = "budget_period", nullable = false, length = 20)
    private String budgetPeriod; // e.g., "2026-Q1", "2026-FY"

    @Column(name = "total_amount", nullable = false, precision = 20, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "status", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private BudgetStatus status = BudgetStatus.DRAFT;

    @Column(name = "description")
    private String description;

    @Version
    private Long version;

    @Override
    public String toString() {
        return "Budget{" +
                "id=" + id +
                ", budgetCode='" + budgetCode + '\'' +
                ", budgetName='" + budgetName + '\'' +
                ", budgetPeriod='" + budgetPeriod + '\'' +
                ", totalAmount=" + totalAmount +
                ", status=" + status +
                '}';
    }

    public enum BudgetStatus {
        DRAFT,
        SUBMITTED,
        APPROVED,
        REJECTED,
        ARCHIVED
    }
}
