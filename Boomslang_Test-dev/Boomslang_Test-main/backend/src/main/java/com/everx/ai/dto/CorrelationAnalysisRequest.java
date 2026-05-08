package com.everx.ai.dto;

import lombok.Data;
import java.util.Map;
import java.util.UUID;

@Data
public class CorrelationAnalysisRequest {
    private UUID tenantId;
    private String modelType;
    private String analysisType;
    private Map<String, Object> variables;
    private Map<String, Object> parameters;
}
