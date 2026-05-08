package com.everx.predictive.dto;

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
public class PredictiveAnalyticsDto {
    private UUID tenantId;
    private Map<String, Object> modelMetrics;
    private Map<String, Object> forecastMetrics;
    private Map<String, Object> predictionMetrics;
    private Map<String, Object> trendMetrics;
    private LocalDateTime generatedAt;
}
