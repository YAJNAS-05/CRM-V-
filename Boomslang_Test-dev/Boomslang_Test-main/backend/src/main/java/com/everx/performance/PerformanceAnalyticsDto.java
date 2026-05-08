package com.everx.performance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PerformanceAnalyticsDto {
    private UUID tenantId;
    private Map<String, Object> metricAnalytics;
    private Map<String, Object> optimizationAnalytics;
    private Map<String, Object> alertAnalytics;
    private Map<String, Object> cacheAnalytics;
    private Map<String, Object> databaseAnalytics;
    private LocalDateTime generatedAt;
}
