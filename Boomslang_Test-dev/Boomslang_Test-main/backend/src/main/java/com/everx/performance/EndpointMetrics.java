package com.everx.performance.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EndpointMetrics {
    private String endpoint;
    private Long requestCount;
    private Long errorCount;
    private Double averageResponseTime;
    private Double errorRate;
    private Long activeConnections;
}
