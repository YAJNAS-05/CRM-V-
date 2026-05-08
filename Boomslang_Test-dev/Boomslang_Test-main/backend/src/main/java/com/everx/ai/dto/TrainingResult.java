package com.everx.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrainingResult {
    private UUID modelId;
    private String status;
    private Double accuracy;
    private Double precision;
    private Double recall;
    private Double f1Score;
    private Long trainingTime;
    private LocalDateTime trainedAt;
    private String algorithm;
    private Map<String, Object> metrics;
    private String errorMessage;
    private Boolean isSuccessful;
    private Integer epochsCompleted;
    private Double loss;
    private Double validationLoss;
}
