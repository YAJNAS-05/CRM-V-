package com.everx.predictive.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "trend_analysis")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrendAnalysis {

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "data_type", nullable = false)
    private DataType dataType;

    @Column(name = "time_range", nullable = false)
    private String timeRange;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "trend_data")
    private List<TrendDataPoint> trendData;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metrics")
    private TrendMetrics metrics;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "patterns")
    private List<TrendPattern> patterns;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "insights")
    private List<String> insights;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "created_by", nullable = false)
    private String createdBy;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "data_source")
    private String dataSource;

    @Column(name = "granularity")
    private String granularity;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "filters")
    private Map<String, Object> filters;

    @Column(name = "confidence_level")
    private Double confidenceLevel;

    @Column(name = "statistical_significance")
    private Double statisticalSignificance;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "forecast_data")
    private List<TrendDataPoint> forecastData;

    @Column(name = "forecast_horizon")
    private Integer forecastHorizon;

    @Column(name = "anomaly_count")
    private Integer anomalyCount;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "anomalies")
    private List<TrendAnomaly> anomalies;

    @Column(name = "seasonality_detected")
    private Boolean seasonalityDetected;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "seasonality_patterns")
    private Map<String, Object> seasonalityPatterns;

    @Column(name = "correlation_analysis")
    private Map<String, Double> correlationAnalysis;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata")
    private Map<String, Object> metadata;

    // Helper methods
    public boolean isCompleted() {
        return Status.COMPLETED.equals(status);
    }

    public boolean hasForecast() {
        return forecastData != null && !forecastData.isEmpty();
    }

    public boolean hasAnomalies() {
        return anomalyCount != null && anomalyCount > 0 && 
               anomalies != null && !anomalies.isEmpty();
    }

    public boolean hasSeasonality() {
        return seasonalityDetected != null && seasonalityDetected;
    }

    public boolean isStatisticallySignificant() {
        return statisticalSignificance != null && statisticalSignificance > 0.95;
    }

    public boolean hasHighConfidence() {
        return confidenceLevel != null && confidenceLevel > 0.9;
    }

    public double getAverageTrendValue() {
        if (trendData == null || trendData.isEmpty()) {
            return 0.0;
        }

        return trendData.stream()
                .mapToDouble(point -> point.getValue() != null ? point.getValue() : 0.0)
                .average()
                .orElse(0.0);
    }

    public double getTrendGrowthRate() {
        if (trendData == null || trendData.size() < 2) {
            return 0.0;
        }

        TrendDataPoint first = trendData.get(0);
        TrendDataPoint last = trendData.get(trendData.size() - 1);

        if (first.getValue() == null || last.getValue() == null || first.getValue() == 0) {
            return 0.0;
        }

        return (last.getValue() - first.getValue()) / first.getValue();
    }

    public void addAnomaly(TrendAnomaly anomaly) {
        if (this.anomalies == null) {
            this.anomalies = new java.util.ArrayList<>();
        }
        this.anomalies.add(anomaly);
        this.anomalyCount = (this.anomalyCount == null ? 0 : this.anomalyCount) + 1;
    }

    public void addInsight(String insight) {
        if (this.insights == null) {
            this.insights = new java.util.ArrayList<>();
        }
        this.insights.add(insight);
    }

    public void addPattern(TrendPattern pattern) {
        if (this.patterns == null) {
            this.patterns = new java.util.ArrayList<>();
        }
        this.patterns.add(pattern);
    }

    public enum DataType {
        SALES,
        REVENUE,
        TRAFFIC,
        CONVERSION,
        ENGAGEMENT,
        PERFORMANCE,
        FINANCIAL,
        OPERATIONAL,
        CUSTOMER,
        PRODUCT,
        MARKETING,
        CUSTOM
    }

    public enum Status {
        PENDING,
        RUNNING,
        COMPLETED,
        FAILED,
        CANCELLED
    }

    @lombok.Data
    @lombok.Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrendDataPoint {
        private LocalDateTime timestamp;
        private Double value;
        private Double movingAverage;
        private Double upperBound;
        private Double lowerBound;
        private String category;
        private Map<String, Object> metadata;
        private Boolean isAnomaly;
        private Double anomalyScore;
    }

    @lombok.Data
    @lombok.Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrendMetrics {
        private Double totalValue;
        private Double averageValue;
        private Double minValue;
        private Double maxValue;
        private Double trend;
        private Double volatility;
        private Double seasonality;
        private Double correlation;
        private Double growthRate;
        private Double acceleration;
    }

    @lombok.Data
    @lombok.Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrendPattern {
        private String patternType;
        private Double confidence;
        private String description;
        private LocalDateTime startDate;
        private LocalDateTime endDate;
        private Double strength;
        private Map<String, Object> parameters;
    }

    @lombok.Data
    @lombok.Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrendAnomaly {
        private LocalDateTime timestamp;
        private Double value;
        private Double expectedValue;
        private Double anomalyScore;
        private String anomalyType;
        private String description;
        private Double severity;
        private Map<String, Object> context;
    }
}
