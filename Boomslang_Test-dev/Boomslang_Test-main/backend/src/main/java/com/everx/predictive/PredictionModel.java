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
@Table(name = "prediction_models")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PredictionModel {

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
    @Column(name = "model_type", nullable = false)
    private ModelType modelType;

    @Column(name = "target_variable", nullable = false)
    private String targetVariable;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "features")
    private List<String> features;

    @Enumerated(EnumType.STRING)
    @Column(name = "algorithm", nullable = false)
    private Algorithm algorithm;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "parameters")
    private Map<String, Object> parameters;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status;

    @Column(name = "accuracy")
    private Double accuracy;

    @Column(name = "precision")
    private Double precision;

    @Column(name = "recall")
    private Double recall;

    @Column(name = "f1_score")
    private Double f1Score;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "created_by", nullable = false)
    private String createdBy;

    @Column(name = "trained_at")
    private LocalDateTime trainedAt;

    @Column(name = "last_retrained_at")
    private LocalDateTime lastRetrainedAt;

    @Column(name = "model_version")
    private Integer modelVersion;

    @Column(name = "training_data_size")
    private Long trainingDataSize;

    @Column(name = "validation_data_size")
    private Long validationDataSize;

    @Column(name = "prediction_count")
    private Long predictionCount;

    @Column(name = "last_prediction_at")
    private LocalDateTime lastPredictionAt;

    @Column(name = "error_rate")
    private Double errorRate;

    @Column(name = "is_active")
    private Boolean isActive;

    @Column(name = "auto_retrain_enabled")
    private Boolean autoRetrainEnabled;

    @Column(name = "retrain_threshold")
    private Double retrainThreshold;

    @Column(name = "model_file_path")
    private String modelFilePath;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "performance_metrics")
    private Map<String, Object> performanceMetrics;

    // Helper methods
    public boolean isTrained() {
        return Status.TRAINED.equals(status);
    }

    public boolean isReady() {
        return isTrained() && (isActive == null || isActive);
    }

    public boolean needsRetraining() {
        if (!autoRetrainEnabled || retrainThreshold == null) {
            return false;
        }
        
        return errorRate != null && errorRate > retrainThreshold;
    }

    public boolean supportsForecasting() {
        return ModelType.TIME_SERIES.equals(modelType) || ModelType.REGRESSION.equals(modelType);
    }

    public void recordPrediction() {
        this.predictionCount = (this.predictionCount == null ? 0L : this.predictionCount) + 1;
        this.lastPredictionAt = LocalDateTime.now();
    }

    public void updatePerformanceMetrics(Double newAccuracy, Double newErrorRate) {
        this.accuracy = newAccuracy;
        this.errorRate = newErrorRate;
        this.lastPredictionAt = LocalDateTime.now();
    }

    public void markAsTrained() {
        this.status = Status.TRAINED;
        this.trainedAt = LocalDateTime.now();
        this.modelVersion = (this.modelVersion == null ? 1 : this.modelVersion + 1);
    }

    public void markAsFailed(String errorMessage) {
        this.status = Status.FAILED;
        this.errorMessage = errorMessage;
    }

    @Column(name = "error_message")
    private String errorMessage;

    public enum ModelType {
        REGRESSION,
        CLASSIFICATION,
        TIME_SERIES,
        CLUSTERING,
        ANOMALY_DETECTION,
        RECOMMENDATION,
        NLP,
        COMPUTER_VISION
    }

    public enum Algorithm {
        LINEAR_REGRESSION,
        LOGISTIC_REGRESSION,
        DECISION_TREE,
        RANDOM_FOREST,
        GRADIENT_BOOSTING,
        SVM,
        NEURAL_NETWORK,
        LSTM,
        ARIMA,
        KMEANS,
        DBSCAN,
        ISOLATION_FOREST,
        COLLABORATIVE_FILTERING,
        CONTENT_BASED,
        TRANSFORMER,
        CNN,
        RNN
    }

    public enum Status {
        DRAFT,
        TRAINING,
        TRAINED,
        FAILED,
        DEPRECATED,
        ARCHIVED
    }
}
