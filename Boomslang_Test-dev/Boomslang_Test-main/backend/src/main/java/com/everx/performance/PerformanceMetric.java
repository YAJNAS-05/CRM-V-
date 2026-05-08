package com.everx.performance.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "performance_metrics")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PerformanceMetric {

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "metric_name", nullable = false)
    private String metricName;

    @Enumerated(EnumType.STRING)
    @Column(name = "metric_type", nullable = false)
    private MetricType metricType;

    @Column(name = "value", nullable = false)
    private Double value;

    @Column(name = "unit")
    private String unit;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "tags")
    private Map<String, String> tags;

    @Column(name = "source", nullable = false)
    private String source;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "host")
    private String host;

    @Column(name = "service")
    private String service;

    @Column(name = "endpoint")
    private String endpoint;

    @Column(name = "user_id")
    private String userId;

    @Column(name = "session_id")
    private String sessionId;

    @Column(name = "request_id")
    private String requestId;

    @Column(name = "correlation_id")
    private String correlationId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "dimensions")
    private Map<String, Object> dimensions;

    @Column(name = "threshold_warning")
    private Double thresholdWarning;

    @Column(name = "threshold_critical")
    private Double thresholdCritical;

    @Column(name = "is_anomaly")
    private Boolean isAnomaly;

    @Column(name = "anomaly_score")
    private Double anomalyScore;

    @Column(name = "baseline_value")
    private Double baselineValue;

    @Column(name = "percent_change")
    private Double percentChange;

    @Column(name = "aggregation_period")
    private String aggregationPeriod;

    @Column(name = "retention_days")
    private Integer retentionDays;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata")
    private Map<String, Object> metadata;

    // Helper methods
    public boolean isAboveWarningThreshold() {
        return thresholdWarning != null && value != null && value > thresholdWarning;
    }

    public boolean isAboveCriticalThreshold() {
        return thresholdCritical != null && value != null && value > thresholdCritical;
    }

    public boolean isBelowWarningThreshold() {
        return thresholdWarning != null && value != null && value < thresholdWarning;
    }

    public boolean isBelowCriticalThreshold() {
        return thresholdCritical != null && value != null && value < thresholdCritical;
    }

    public boolean isAnomalous() {
        return isAnomaly != null && isAnomaly;
    }

    public boolean hasHighAnomalyScore() {
        return anomalyScore != null && anomalyScore > 0.8;
    }

    public boolean isSignificantChange() {
        return percentChange != null && Math.abs(percentChange) > 20.0; // 20% change threshold
    }

    public boolean isIncreasing() {
        return percentChange != null && percentChange > 0;
    }

    public boolean isDecreasing() {
        return percentChange != null && percentChange < 0;
    }

    public boolean isRecent() {
        return timestamp.isAfter(LocalDateTime.now().minusMinutes(5));
    }

    public boolean isSystemMetric() {
        return MetricType.SYSTEM.equals(metricType);
    }

    public boolean isApplicationMetric() {
        return MetricType.APPLICATION.equals(metricType);
    }

    public boolean isBusinessMetric() {
        return MetricType.BUSINESS.equals(metricType);
    }

    public void calculatePercentChange() {
        if (baselineValue != null && baselineValue != 0 && value != null) {
            this.percentChange = ((value - baselineValue) / baselineValue) * 100;
        }
    }

    public void markAsAnomaly(double score) {
        this.isAnomaly = true;
        this.anomalyScore = score;
    }

    public void clearAnomaly() {
        this.isAnomaly = false;
        this.anomalyScore = null;
    }

    public enum MetricType {
        SYSTEM,        // CPU, memory, disk, network
        APPLICATION,   // Response time, throughput, error rate
        BUSINESS,      // Revenue, conversions, user engagement
        CUSTOM
    }
}
