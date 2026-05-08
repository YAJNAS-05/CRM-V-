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
public class TrendAnalysisDto {
    private UUID id;
    private UUID tenantId;
    private String name;
    private String description;
    private DataType dataType;
    private String timeRange;
    private Status status;
    private LocalDateTime createdAt;
    private String dataSource;
    private String granularity;
    private Double confidenceLevel;
    private Double statisticalSignificance;
    private Boolean hasForecast;
    private Boolean hasAnomalies;
    private Boolean seasonalityDetected;

    public enum DataType {
        SALES,
        REVENUE,
        TRAFFIC,
        CONVERSION,
        ENGAGEMENT,
        PERFORMANCE,
        FINANCIAL,
        OPERATIONAL,
        CUSTOMER,
        PRODUCT,
        MARKETING,
        CUSTOM
    }

    public enum Status {
        PENDING,
        RUNNING,
        COMPLETED,
        FAILED,
        CANCELLED
    }
}
