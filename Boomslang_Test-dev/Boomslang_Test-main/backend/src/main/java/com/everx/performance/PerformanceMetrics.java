package com.everx.performance.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class PerformanceMetrics {
    private Long totalRequests;
    private Long totalErrors;
    private Double averageResponseTime;
    private Long activeConnections;
    private Long cacheHits;
    private Long cacheMisses;
    private Double errorRate;
    private Double cacheHitRate;
    private Long memoryUsageMB;
    private Double cpuUsage;
    private LocalDateTime timestamp;
}
