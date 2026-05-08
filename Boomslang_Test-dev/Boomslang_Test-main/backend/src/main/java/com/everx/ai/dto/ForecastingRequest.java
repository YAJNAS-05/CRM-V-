package com.everx.ai.dto;

import lombok.Data;
import java.util.Map;
import java.util.UUID;

@Data
public class ForecastingRequest {
    private UUID tenantId;
    private String modelType;
    private String targetMetric;
    private String forecastHorizon;
    private Map<String, Object> parameters;
}
