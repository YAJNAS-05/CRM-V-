package com.everx.ai.dto;

import lombok.Data;
import java.util.Map;
import java.util.UUID;

@Data
public class ForecastingResult {
    private UUID modelId;
    private Map<String, Object> forecast;
    private Double confidenceScore;
    private String status;
}
