package com.everx.performance.dto;

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
public class OptimizationRuleDto {
    private UUID id;
    private UUID tenantId;
    private String name;
    private String description;
    private RuleType ruleType;
    private Integer priority;
    private Boolean isEnabled;
    private Boolean autoApply;
    private Integer cooldownMinutes;
    private LocalDateTime createdAt;
    private LocalDateTime lastAppliedAt;
    private Long applicationCount;
    private Double successRate;
    private String category;
    private Boolean isSystemRule;

    public enum RuleType {
        SCALING,        // Auto-scaling rules
        CACHING,        // Cache optimization
        DATABASE,       // Database optimization
        NETWORK,        // Network optimization
        SECURITY,       // Security optimization
        RESOURCE,       // Resource allocation
        MONITORING,     // Monitoring adjustments
        ALERTING,       // Alert rule optimization
        PERFORMANCE,    // Performance tuning
        COST,           // Cost optimization
        CUSTOM
    }
}
