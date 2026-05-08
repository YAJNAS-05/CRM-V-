package com.everx.ai.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InsightRequest {
    
    private UUID id;
    private String insightType;
    private UUID tenantId;
    private Map<String, Object> parameters;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String dataSource;
    private Map<String, Object> filters;
    private String priority;
    private Boolean includeRecommendations;
    
    public String getInsightType() {
        return insightType;
    }
    
    public void setInsightType(String insightType) {
        this.insightType = insightType;
    }
}
