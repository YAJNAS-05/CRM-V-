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
@Table(name = "prediction_results")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PredictionResult {

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "model_id", nullable = false)
    private UUID modelId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "input_data")
    private Map<String, Object> inputData;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "prediction")
    private Object prediction;

    @Column(name = "confidence")
    private Double confidence;

    @Column(name = "explanation")
    private String explanation;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "features")
    private List<String> features;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status;

    @Column(name = "executed_at", nullable = false)
    private LocalDateTime executedAt;

    @Column(name = "executed_by", nullable = false)
    private String executedBy;

    @Column(name = "processing_time_ms")
    private Long processingTimeMs;

    @Column(name = "actual_result")
    private Object actualResult;

    @Column(name = "actual_confirmed_at")
    private LocalDateTime actualConfirmedAt;

    @Column(name = "actual_confirmed_by")
    private String actualConfirmedBy;

    @Column(name = "prediction_accuracy")
    private Double predictionAccuracy;

    @Column(name = "error_message")
    private String errorMessage;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata")
    private Map<String, Object> metadata;

    @Column(name = "prediction_type")
    private String predictionType;

    @Column(name = "risk_score")
    private Double riskScore;

    @Column(name = "is_anomaly")
    private Boolean isAnomaly;

    @Column(name = "anomaly_score")
    private Double anomalyScore;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "alternative_predictions")
    private List<AlternativePrediction> alternativePredictions;

    @Column(name = "model_version")
    private Integer modelVersion;

    @Column(name = "batch_id")
    private String batchId;

    @Column(name = "correlation_id")
    private String correlationId;

    // Helper methods
    public boolean isSuccessful() {
        return Status.COMPLETED.equals(status);
    }

    public boolean isFailed() {
        return Status.FAILED.equals(status);
    }

    public boolean hasActualResult() {
        return actualResult != null && actualConfirmedAt != null;
    }

    public void calculateAccuracy() {
        if (!hasActualResult() || prediction == null || actualResult == null) {
            return;
        }

        // For numeric predictions
        if (prediction instanceof Number && actualResult instanceof Number) {
            double predicted = ((Number) prediction).doubleValue();
            double actual = ((Number) actualResult).doubleValue();
            
            if (actual != 0) {
                this.predictionAccuracy = 1.0 - Math.abs(predicted - actual) / Math.abs(actual);
                this.predictionAccuracy = Math.max(0.0, Math.min(1.0, this.predictionAccuracy));
            } else {
                this.predictionAccuracy = predicted == actual ? 1.0 : 0.0;
            }
        }
        // For categorical predictions
        else if (prediction instanceof String && actualResult instanceof String) {
            this.predictionAccuracy = prediction.equals(actualResult) ? 1.0 : 0.0;
        }
        // For map predictions (classification with probabilities)
        else if (prediction instanceof Map && actualResult instanceof String) {
            @SuppressWarnings("unchecked")
            Map<String, Double> predictionMap = (Map<String, Double>) prediction;
            this.predictionAccuracy = predictionMap.getOrDefault(actualResult.toString(), 0.0);
        }
    }

    public void confirmActualResult(Object actualResult, String confirmedBy) {
        this.actualResult = actualResult;
        this.actualConfirmedAt = LocalDateTime.now();
        this.actualConfirmedBy = confirmedBy;
        calculateAccuracy();
    }

    public boolean isHighRisk() {
        return riskScore != null && riskScore > 0.7;
    }

    public boolean isAnomalous() {
        return isAnomaly != null && isAnomaly;
    }

    public boolean hasHighConfidence() {
        return confidence != null && confidence > 0.8;
    }

    public boolean hasLowConfidence() {
        return confidence != null && confidence < 0.5;
    }

    public enum Status {
        PENDING,
        PROCESSING,
        COMPLETED,
        FAILED,
        CANCELLED,
        TIMEOUT
    }

    @lombok.Data
    @lombok.Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AlternativePrediction {
        private Object prediction;
        private Double confidence;
        private String reason;
        private String modelVariant;
    }
}
