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
public class ForecastDto {
    private UUID id;
    private UUID tenantId;
    private UUID modelId;
    private ForecastType forecastType;
    private Integer timeHorizon;
    private Double confidenceLevel;
    private Status status;
    private LocalDateTime generatedAt;
    private LocalDateTime validUntil;
    private Double accuracyScore;
    private String forecastName;
    private Boolean isPublished;

    public enum ForecastType {
        SALES,
        REVENUE,
        DEMAND,
        INVENTORY,
        TRAFFIC,
        CONVERSION,
        CHURN,
        GROWTH,
        SEASONAL,
        TREND,
        CUSTOM
    }

    public enum Status {
        PENDING,
        GENERATING,
        COMPLETED,
        FAILED,
        EXPIRED,
        ARCHIVED
    }
}
