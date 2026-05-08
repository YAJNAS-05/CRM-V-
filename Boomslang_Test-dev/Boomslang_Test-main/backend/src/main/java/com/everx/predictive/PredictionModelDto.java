package com.everx.predictive.dto;

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
public class PredictionModelDto {
    private UUID id;
    private UUID tenantId;
    private String name;
    private String description;
    private ModelType modelType;
    private String targetVariable;
    private Algorithm algorithm;
    private Status status;
    private Double accuracy;
    private Double precision;
    private Double recall;
    private Double f1Score;
    private LocalDateTime createdAt;
    private LocalDateTime trainedAt;
    private Long predictionCount;
    private Double errorRate;
    private Boolean isActive;
    private Boolean autoRetrainEnabled;

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
