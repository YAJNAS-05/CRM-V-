package com.everx.ai.dto;

import lombok.Data;
import java.util.Map;
import java.util.UUID;

@Data
public class OptimizationRequest {
    private UUID tenantId;
    private String modelType;
    private String optimizationGoal;
    private Map<String, Object> constraints;
    private Map<String, Object> parameters;
}
