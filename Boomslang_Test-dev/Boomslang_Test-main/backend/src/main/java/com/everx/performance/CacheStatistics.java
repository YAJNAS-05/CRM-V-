package com.everx.performance.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CacheStatistics {
    private String cacheName;
    private Long size;
    private Long hits;
    private Long misses;
    private Double hitRate;
    private LocalDateTime lastAccessTime;
}
