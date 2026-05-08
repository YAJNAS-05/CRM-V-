package com.everx.ai.dto;

import lombok.Data;
import java.util.Map;
import java.util.UUID;

@Data
public class PredictionRequest {
    private UUID tenantId;
    private String modelType;
    private Map<String, Object> data;
    private Map<String, Object> predictionParameters;
}
