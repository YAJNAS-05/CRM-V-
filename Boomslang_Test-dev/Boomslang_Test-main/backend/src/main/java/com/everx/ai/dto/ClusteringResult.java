package com.everx.ai.dto;

import lombok.Data;
import java.util.Map;
import java.util.UUID;

@Data
public class ClusteringResult {
    private UUID modelId;
    private Map<String, Object> clusters;
    private Double silhouetteScore;
    private String status;
}
