package com.everx.ai.dto;

import lombok.Data;
import java.util.Map;
import java.util.UUID;

@Data
public class OptimizationResult {
    private UUID modelId;
    private Map<String, Object> optimization;
    private Double improvementScore;
    private String status;
}
