package com.everx.api.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ApiUsageStatsDto {
    private Long totalRequests;
    private Long successRequests;
    private Long errorRequests;
    private Double successRate;
    private Double averageResponseTime;
}
