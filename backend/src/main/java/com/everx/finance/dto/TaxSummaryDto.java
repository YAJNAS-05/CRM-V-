package com.everx.finance.dto;

import com.everx.finance.entity.TaxCalculation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaxSummaryDto {
    private LocalDate periodStart;
    private LocalDate periodEnd;
    private BigDecimal totalTaxableBase;
    private BigDecimal totalTaxAmount;
    private BigDecimal totalPayable;
    private List<TaxCalculation> calculations;
}
