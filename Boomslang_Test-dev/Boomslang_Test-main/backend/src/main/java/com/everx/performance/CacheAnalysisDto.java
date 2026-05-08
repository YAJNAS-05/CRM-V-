package com.everx.performance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CacheAnalysisDto {
    private Double totalCacheSize;
    private Double hitRate;
    private Double missRate;
    private Double evictionRate;
    private Double averageAccessTime;
    private Double memoryUsage;
    private String cacheType;
    private Map<String, Object> detailedMetrics;
    private String recommendations;
}
