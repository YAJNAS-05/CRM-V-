package com.everx.ai.dto;

import lombok.Data;
import java.util.Map;
import java.util.UUID;

@Data
public class RecommendationResult {
    private UUID modelId;
    private Map<String, Object> recommendations;
    private Double confidenceScore;
    private String status;
}
