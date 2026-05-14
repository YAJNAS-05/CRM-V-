package com.everx.shared.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OperationsDashboardMetrics {
    private BigDecimal salesPipeline;
    private long openDeals;
    private double winRate;
    private long fieldJobsPending;
    private long fieldJobsCompleted;
    private double slaCompliance;
    private BigDecimal cashPosition;
    private BigDecimal arOutstanding;
    private long headcount;
    private long openPositions;
    private long pendingLeaves;
    private int activeAlerts;
    
    private List<CapacityMetric> capacities;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CapacityMetric {
        private String label;
        private int usedPercentage;
        private String color;
    }
}
