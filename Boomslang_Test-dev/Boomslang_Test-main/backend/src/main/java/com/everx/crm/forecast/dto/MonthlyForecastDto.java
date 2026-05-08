package com.everx.crm.forecast.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyForecastDto {
    private String yearMonth;
    private int dealCount;
    private BigDecimal totalValue;
    private BigDecimal weightedValue;
}
