package com.everx.ai.dto;

import lombok.Data;
import java.util.Map;
import java.util.UUID;

@Data
public class SentimentAnalysisResult {
    private UUID modelId;
    private String sentiment;
    private Double confidenceScore;
    private Map<String, Object> emotions;
    private String status;
}
