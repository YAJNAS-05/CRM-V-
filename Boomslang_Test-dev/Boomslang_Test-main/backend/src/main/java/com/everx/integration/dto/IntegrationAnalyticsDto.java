package com.everx.integration.dto;

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
public class IntegrationAnalyticsDto {
    private UUID tenantId;
    private Map<String, Object> integrationMetrics;
    private Map<String, Object> executionMetrics;
    private Map<String, Object> systemMetrics;
    private Map<String, Object> errorMetrics;
    private LocalDateTime generatedAt;
}
