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
@Table(name = "forecasts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Forecast {

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "model_id", nullable = false)
    private UUID modelId;

    @Enumerated(EnumType.STRING)
    @Column(name = "forecast_type", nullable = false)
    private ForecastType forecastType;

    @Column(name = "time_horizon", nullable = false)
    private Integer timeHorizon;

    @Column(name = "confidence_level", nullable = false)
    private Double confidenceLevel;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "data_points")
    private List<ForecastDataPoint> dataPoints;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metrics")
    private ForecastMetrics metrics;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status;

    @Column(name = "generated_at", nullable = false)
    private LocalDateTime generatedAt;

    @Column(name = "generated_by", nullable = false)
    private String generatedBy;

    @Column(name = "valid_until", nullable = false)
    private LocalDateTime validUntil;

    @Column(name = "actual_data_available")
    private Boolean actualDataAvailable;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "actual_data")
    private List<ForecastDataPoint> actualData;

    @Column(name = "accuracy_score")
    private Double accuracyScore;

    @Column(name = "mean_absolute_error")
    private Double meanAbsoluteError;

    @Column(name = "mean_squared_error")
    private Double meanSquaredError;

    @Column(name = "forecast_name")
    private String forecastName;

    @Column(name = "description")
    private String description;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata")
    private Map<String, Object> metadata;

    @Column(name = "is_published")
    private Boolean isPublished;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @Column(name = "published_by")
    private String publishedBy;

    // Helper methods
    public boolean isValid() {
        return LocalDateTime.now().isBefore(validUntil);
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(validUntil);
    }

    public boolean hasActualData() {
        return actualDataAvailable != null && actualDataAvailable && 
               actualData != null && !actualData.isEmpty();
    }

    public void calculateAccuracy() {
        if (!hasActualData() || dataPoints == null || actualData == null) {
            return;
        }

        double totalError = 0.0;
        int validPoints = 0;

        for (int i = 0; i < Math.min(dataPoints.size(), actualData.size()); i++) {
            ForecastDataPoint predicted = dataPoints.get(i);
            ForecastDataPoint actual = actualData.get(i);
            
            if (predicted.getValue() != null && actual.getValue() != null) {
                totalError += Math.abs(predicted.getValue() - actual.getValue());
                validPoints++;
            }
        }

        if (validPoints > 0) {
            this.meanAbsoluteError = totalError / validPoints;
            this.meanSquaredError = totalError * totalError / validPoints;
            this.accuracyScore = Math.max(0.0, 1.0 - (this.meanAbsoluteError / getAverageActualValue()));
        }
    }

    private Double getAverageActualValue() {
        if (actualData == null || actualData.isEmpty()) {
            return 1.0;
        }

        return actualData.stream()
                .mapToDouble(point -> point.getValue() != null ? point.getValue() : 0.0)
                .average()
                .orElse(1.0);
    }

    public void publish(String publishedBy) {
        this.isPublished = true;
        this.publishedAt = LocalDateTime.now();
        this.publishedBy = publishedBy;
    }

    public void unpublish() {
        this.isPublished = false;
        this.publishedAt = null;
        this.publishedBy = null;
    }

    public enum ForecastType {
        SALES,
        REVENUE,
        DEMAND,
        INVENTORY,
        TRAFFIC,
        CONVERSION,
        CHURN,
        GROWTH,
        SEASONAL,
        TREND,
        CUSTOM
    }

    public enum Status {
        PENDING,
        GENERATING,
        COMPLETED,
        FAILED,
        EXPIRED,
        ARCHIVED
    }

    @lombok.Data
    @lombok.Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ForecastDataPoint {
        private LocalDateTime timestamp;
        private Double value;
        private Double lowerBound;
        private Double upperBound;
        private Double confidence;
        private String category;
        private Map<String, Object> metadata;
    }

    @lombok.Data
    @lombok.Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ForecastMetrics {
        private Double totalValue;
        private Double averageValue;
        private Double minValue;
        private Double maxValue;
        private Double trend;
        private Double volatility;
        private Double seasonality;
        private Double confidence;
        private Double accuracy;
    }
}
