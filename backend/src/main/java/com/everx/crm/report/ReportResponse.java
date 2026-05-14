package com.everx.crm.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportResponse {

    private DashboardKPIs dashboard;
    private PipelineReport pipeline;
    private ConversionReport conversion;
    private ActivityReport activities;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DashboardKPIs {
        private long totalLeads;
        private long totalContacts;
        private long totalAccounts;
        private long totalDeals;
        private long openDeals;
        private long wonDeals;
        private long lostDeals;
        private BigDecimal totalPipelineValue;
        private BigDecimal wonValue;
        private double winRate;
        private String visibilityScope;
        private UUID viewerUserId;
        private int teamMemberCount;
        private List<UserPerformance> userPerformance;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserPerformance {
        private UUID userId;
        private String userName;
        private long leads;
        private long convertedLeads;
        private long deals;
        private long openDeals;
        private long wonDeals;
        private long lostDeals;
        private BigDecimal pipelineValue;
        private long activities;
        private long completedActivities;
        private long overdueActivities;
        private double leadConversionRate;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PipelineReport {
        private Map<String, Long> dealCountByStage;
        private Map<String, BigDecimal> dealValueByStage;
        private BigDecimal totalPipelineValue;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ConversionReport {
        private long totalLeads;
        private long convertedLeads;
        private double conversionRate;
        private Map<String, Long> leadsByStatus;
        private Map<String, Long> leadsBySource;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ActivityReport {
        private long totalActivities;
        private long completedActivities;
        private long pendingActivities;
        private long overdueActivities;
        private Map<String, Long> activitiesByType;
    }
}
