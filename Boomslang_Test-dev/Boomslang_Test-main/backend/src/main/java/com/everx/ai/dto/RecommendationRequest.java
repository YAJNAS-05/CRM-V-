package com.everx.ai.dto;

import lombok.Data;
import java.util.Map;
import java.util.UUID;

@Data
public class RecommendationRequest {
    private UUID tenantId;
    private String modelType;
    private String recommendationType;
    private Map<String, Object> context;
    private Map<String, Object> parameters;
}
