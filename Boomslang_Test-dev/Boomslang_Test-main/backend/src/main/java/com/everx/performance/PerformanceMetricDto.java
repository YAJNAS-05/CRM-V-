package com.everx.performance.dto;

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
public class PerformanceMetricDto {
    private String metricName;
    private PerformanceMetric.MetricType metricType;
    private Double value;
    private String unit;
    private Map<String, String> tags;
    private String source;
    private LocalDateTime timestamp;
    private String host;
    private String service;
    private String endpoint;
    private String userId;
    private String correlationId;
    private Map<String, Object> dimensions;
    private Double thresholdWarning;
    private Double thresholdCritical;

    public enum MetricType {
        SYSTEM,        // CPU, memory, disk, network
        APPLICATION,   // Response time, throughput, error rate
        BUSINESS,      // Revenue, conversions, user engagement
        CUSTOM
    }
}
