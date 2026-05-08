package com.everx.compliance.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplianceAnalyticsDto {
    private String reportType;
    private LocalDateTime generatedAt;
    private LocalDateTime periodStart;
    private LocalDateTime periodEnd;
    private SummaryStatistics summary;
    private List<FrameworkAnalytics> frameworkAnalytics;
    private Map<String, Object> trends;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SummaryStatistics {
        private int totalEntities;
        private int compliantEntities;
        private int nonCompliantEntities;
        private double overallComplianceRate;
        private int highRiskCount;
        private int mediumRiskCount;
        private int lowRiskCount;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FrameworkAnalytics {
        private String frameworkCode;
        private String frameworkName;
        private double complianceRate;
        private int totalChecks;
        private int passedChecks;
        private int failedChecks;
        private List<String> commonViolations;
    }
}
