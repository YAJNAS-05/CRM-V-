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
public class CreateModelRequest {
    private String name;
    private String description;
    private PredictionModelDto.ModelType modelType;
    private String targetVariable;
    private List<String> features;
    private PredictionModelDto.Algorithm algorithm;
    private Map<String, Object> parameters;
    private Integer priority;
    private Integer maxExecutions;
    private Integer timeoutMinutes;
    private String retryPolicy;
    private String createdBy;
}
