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
public class ComplianceStatusDto {
    private String entityType;
    private String entityId;
    private String overallStatus;
    private double overallScore;
    private List<FrameworkComplianceStatus> frameworkStatuses;
    private LocalDateTime lastChecked;
    private List<String> recommendations;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FrameworkComplianceStatus {
        private String frameworkCode;
        private String frameworkName;
        private String status;
        private double score;
        private List<String> violatedPolicies;
        private List<String> recommendations;
    }
}
