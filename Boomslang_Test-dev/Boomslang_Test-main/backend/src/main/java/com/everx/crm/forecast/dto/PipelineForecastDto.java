package com.everx.crm.forecast.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PipelineForecastDto {
    private ForecastSummaryDto summary;
    private List<StageForecastDto> byStage;
    private List<MonthlyForecastDto> byMonth;
    private List<QuarterlyForecastDto> byQuarter;
    private PipelineTrendDto trend;
    private int healthScore;
    private List<String> recommendations;
}
