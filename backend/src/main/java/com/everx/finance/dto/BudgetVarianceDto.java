package com.everx.finance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetVarianceDto {
    private Long budgetId;
    private String budgetMonth;
    private BigDecimal totalBudgeted;
    private BigDecimal totalActual;
    private BigDecimal variance;
    private BigDecimal variancePercent;
}
