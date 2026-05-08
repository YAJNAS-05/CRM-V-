package com.everx.ai.dto;

import lombok.Data;
import java.util.Map;
import java.util.UUID;

@Data
public class ClusteringRequest {
    private UUID tenantId;
    private String modelType;
    private String clusteringAlgorithm;
    private Map<String, Object> features;
    private Map<String, Object> parameters;
}
