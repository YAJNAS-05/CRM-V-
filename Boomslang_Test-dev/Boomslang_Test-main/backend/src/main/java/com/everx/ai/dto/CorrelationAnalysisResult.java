package com.everx.ai.dto;

import lombok.Data;
import java.util.Map;
import java.util.UUID;

@Data
public class CorrelationAnalysisResult {
    private UUID modelId;
    private Map<String, Object> correlations;
    private Double significanceLevel;
    private String status;
}
