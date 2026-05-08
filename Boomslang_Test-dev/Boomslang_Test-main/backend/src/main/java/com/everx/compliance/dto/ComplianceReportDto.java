package com.everx.compliance.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplianceReportDto {
    private String id;
    private String frameworkId;
    private String title;
    private String summary;
    private double overallScore;
    private String status;
    private LocalDateTime reportDate;
    private LocalDateTime createdAt;
    private List<FrameworkComplianceResult> frameworkResults;
    private List<String> recommendations;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FrameworkComplianceResult {
        private String frameworkCode;
        private String frameworkName;
        private double score;
        private String status;
        private List<PolicyComplianceResult> policyResults;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PolicyComplianceResult {
        private String policyCode;
        private String policyName;
        private String status;
        private String description;
        private List<String> violations;
    }
}
