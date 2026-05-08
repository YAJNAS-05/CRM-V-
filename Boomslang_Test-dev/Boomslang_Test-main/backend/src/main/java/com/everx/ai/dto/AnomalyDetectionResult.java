package com.everx.ai.dto;

import lombok.Data;
import java.util.Map;
import java.util.UUID;

@Data
public class AnomalyDetectionResult {
    private UUID modelId;
    private Map<String, Object> anomalies;
    private Double confidenceScore;
    private String status;
}
