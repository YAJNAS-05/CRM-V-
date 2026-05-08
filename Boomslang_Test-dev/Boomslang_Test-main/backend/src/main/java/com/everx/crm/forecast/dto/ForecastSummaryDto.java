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
public class ForecastSummaryDto {
    private BigDecimal totalPipelineValue;
    private BigDecimal weightedForecast;
    private BigDecimal bestCaseForecast;
    private BigDecimal commitForecast;
    private int openDealCount;
}
