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
public class SalesVelocityDto {
    private int averageDaysToClose;
    private BigDecimal averageDealSize;
    private double winRate;
    private int opportunitiesCreated;
    private BigDecimal revenueVelocity;
}
