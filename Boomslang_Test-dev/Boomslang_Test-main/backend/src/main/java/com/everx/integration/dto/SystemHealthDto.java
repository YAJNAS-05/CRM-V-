package com.everx.integration.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemHealthDto {
    private String systemName;
    private ExternalSystemDto.HealthStatus healthStatus;
    private String healthMessage;
    private Long responseTime;
    private LocalDateTime lastHealthCheck;
    private Double successRate;
    private Long activeConnections;
    private Map<String, Object> detailedMetrics;
    private Boolean isHealthy;
    private Boolean hasRecentErrors;
    private Boolean isAtRateLimit;
    private Boolean hasTimeout;
}
