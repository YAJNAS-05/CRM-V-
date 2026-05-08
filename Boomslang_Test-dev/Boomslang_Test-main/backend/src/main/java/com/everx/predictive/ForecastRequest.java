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
public class ForecastRequest {
    private UUID modelId;
    private ForecastDto.ForecastType forecastType;
    private Integer timeHorizon;
    private Double confidenceLevel;
    private Map<String, Object> parameters;
    private String generatedBy;
    private String forecastName;
    private String description;
    private String dataSource;
    private Map<String, Object> filters;
}
