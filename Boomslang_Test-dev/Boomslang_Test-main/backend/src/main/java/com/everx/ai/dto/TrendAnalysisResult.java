package com.everx.ai.dto;

import lombok.Data;
import java.util.Map;
import java.util.UUID;

@Data
public class TrendAnalysisResult {
    private UUID modelId;
    private String trend;
    private String seasonality;
    private Map<String, Object> forecast;
    private Map<String, Double> confidenceInterval;
    private String status;
}
