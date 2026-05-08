package com.everx.ai.dto;

import lombok.Data;
import java.util.Map;
import java.util.UUID;

@Data
public class TrendAnalysisRequest {
    private UUID tenantId;
    private String modelType;
    private String metric;
    private String timeRange;
    private Map<String, Object> parameters;
}
