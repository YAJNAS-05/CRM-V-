package com.everx.performance.dto;

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
public class CreateOptimizationRuleRequest {
    private String name;
    private String description;
    private OptimizationRuleDto.RuleType ruleType;
    private List<Map<String, Object>> conditions;
    private List<Map<String, Object>> actions;
    private Integer priority;
    private Boolean autoApply;
    private Integer cooldownMinutes;
    private Double successRateThreshold;
    private Integer maxApplicationsPerHour;
    private Boolean requiresApproval;
    private String category;
    private String createdBy;
}
