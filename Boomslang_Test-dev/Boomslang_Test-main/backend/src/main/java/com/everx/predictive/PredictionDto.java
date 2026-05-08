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
public class PredictionDto {
    private UUID id;
    private UUID tenantId;
    private UUID modelId;
    private Object prediction;
    private Double confidence;
    private String explanation;
    private Status status;
    private LocalDateTime executedAt;
    private Double predictionAccuracy;
    private Double riskScore;
    private Boolean isAnomaly;
    private String predictionType;

    public enum Status {
        PENDING,
        PROCESSING,
        COMPLETED,
        FAILED,
        CANCELLED,
        TIMEOUT
    }
}
