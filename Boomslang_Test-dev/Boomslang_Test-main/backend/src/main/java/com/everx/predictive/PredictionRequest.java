package com.everx.predictive.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PredictionRequest {
    private UUID modelId;
    private Map<String, Object> inputData;
    private List<String> features;
    private String executedBy;
    private String predictionType;
    private String correlationId;
    private String batchId;
    private Map<String, Object> metadata;
    private Boolean includeExplanation;
    private Boolean includeAlternativePredictions;
    private Double confidenceThreshold;
}
