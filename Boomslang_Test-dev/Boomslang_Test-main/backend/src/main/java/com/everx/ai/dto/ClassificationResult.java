package com.everx.ai.dto;

import lombok.Data;
import java.util.Map;
import java.util.UUID;

@Data
public class ClassificationResult {
    private UUID modelId;
    private String classification;
    private Double confidenceScore;
    private Map<String, Object> probabilities;
    private String status;
}
