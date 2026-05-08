package com.everx.ai.dto;

import lombok.Data;
import java.util.Map;
import java.util.UUID;

@Data
public class PatternRecognitionResult {
    private UUID modelId;
    private Map<String, Object> patterns;
    private Double confidenceScore;
    private String status;
}
