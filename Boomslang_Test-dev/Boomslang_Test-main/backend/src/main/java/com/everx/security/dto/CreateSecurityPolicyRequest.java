package com.everx.security.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateSecurityPolicyRequest {
    private String name;
    private String description;
    private SecurityPolicyDto.PolicyType policyType;
    private List<Map<String, Object>> rules;
    private SecurityPolicyDto.EnforcementLevel enforcementLevel;
    private Integer priority;
    private Map<String, Object> conditions;
    private List<Map<String, Object>> exceptions;
    private Boolean autoBlockEnabled;
    private Boolean notificationEnabled;
    private List<String> notificationRecipients;
    private Integer gracePeriodMinutes;
    private Integer cooldownPeriodMinutes;
    private String complianceFramework;
    private Double riskScoreThreshold;
    private String createdBy;
}
