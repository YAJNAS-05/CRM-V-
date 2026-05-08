package com.everx.performance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PerformanceAlertDto {
    private UUID id;
    private UUID tenantId;
    private String metricName;
    private PerformanceAlert.AlertType alertType;
    private PerformanceAlert.Severity severity;
    private Double thresholdValue;
    private Double actualValue;
    private String condition;
    private String message;
    private PerformanceAlert.Status status;
    private LocalDateTime triggeredAt;
    private LocalDateTime acknowledgedAt;
    private LocalDateTime resolvedAt;
    private String source;
    private String service;

    public enum AlertType {
        THRESHOLD,      // Value exceeded threshold
        ANOMALY,        // Anomalous pattern detected
        TREND,          // Unusual trend
        AVAILABILITY,   // Service unavailable
        PERFORMANCE,    // Performance degradation
        CAPACITY,       // Capacity issues
        ERROR_RATE,     // High error rate
        LATENCY,        // High latency
        CUSTOM
    }

    public enum Severity {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL
    }

    public enum Status {
        ACTIVE,
        ACKNOWLEDGED,
        RESOLVED,
        FALSE_POSITIVE,
        SUPPRESSED
    }
}
