package com.everx.ai.dto;

import lombok.Data;
import java.util.Map;
import java.util.UUID;

@Data
public class PatternRecognitionRequest {
    private UUID tenantId;
    private String modelType;
    private String patternType;
    private Map<String, Object> data;
    private Map<String, Object> parameters;
}
