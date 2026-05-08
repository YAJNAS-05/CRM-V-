package com.everx.predictive.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTrendAnalysisRequest {
    private String name;
    private String description;
    private TrendAnalysisDto.DataType dataType;
    private String timeRange;
    private String dataSource;
    private String granularity;
    private Map<String, Object> filters;
    private Double confidenceLevel;
    private Integer forecastHorizon;
    private String createdBy;
}
