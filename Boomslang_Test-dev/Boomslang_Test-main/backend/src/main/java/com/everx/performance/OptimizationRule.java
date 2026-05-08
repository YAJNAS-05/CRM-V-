package com.everx.performance.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
    import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "optimization_rules")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OptimizationRule {

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "rule_type", nullable = false)
    private RuleType ruleType;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "conditions")
    private List<Map<String, Object>> conditions;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "actions")
    private List<Map<String, Object>> actions;

    @Column(name = "priority")
    private Integer priority;

    @Column(name = "is_enabled", nullable = false)
    private Boolean isEnabled;

    @Column(name = "auto_apply", nullable = false)
    private Boolean autoApply;

    @Column(name = "cooldown_minutes")
    private Integer cooldownMinutes;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "created_by", nullable = false)
    private String createdBy;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "last_applied_at")
    private LocalDateTime lastAppliedAt;

    @Column(name = "applied_by")
    private String appliedBy;

    @Column(name = "application_count")
    private Long applicationCount;

    @Column(name = "success_count")
    private Long successCount;

    @Column(name = "failure_count")
    private Long failureCount;

    @Column(name = "version")
    private Integer version;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata")
    private Map<String, Object> metadata;

    @Column(name = "tags")
    private List<String> tags;

    @Column(name = "category")
    private String category;

    @Column(name = "success_rate_threshold")
    private Double successRateThreshold;

    @Column(name = "max_applications_per_hour")
    private Integer maxApplicationsPerHour;

    @Column(name = "last_application_attempt_at")
    private LocalDateTime lastApplicationAttemptAt;

    @Column(name = "is_system_rule")
    private Boolean isSystemRule;

    @Column(name = "requires_approval")
    private Boolean requiresApproval;

    @Column(name = "approved_by")
    private String approvedBy;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    // Helper methods
    public boolean isActive() {
        return isEnabled != null && isEnabled;
    }

    public boolean canAutoApply() {
        return autoApply != null && autoApply && 
               (requiresApproval == null || !requiresApproval);
    }

    public boolean isInCooldown() {
        return cooldownMinutes != null && lastAppliedAt != null &&
               lastAppliedAt.isAfter(LocalDateTime.now().minusMinutes(cooldownMinutes));
    }

    public boolean hasReachedMaxApplications() {
        if (maxApplicationsPerHour == null || lastApplicationAttemptAt == null) {
            return false;
        }
        
        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
        if (lastApplicationAttemptAt.isBefore(oneHourAgo)) {
            return false;
        }
        
        return applicationCount != null && applicationCount >= maxApplicationsPerHour;
    }

    public boolean canBeApplied() {
        return isActive() && !isInCooldown() && !hasReachedMaxApplications();
    }

    public double getSuccessRate() {
        if (applicationCount == null || applicationCount == 0) {
            return 0.0;
        }
        return (double) (successCount == null ? 0L : successCount) / applicationCount;
    }

    public boolean isBelowSuccessThreshold() {
        return successRateThreshold != null && getSuccessRate() < successRateThreshold;
    }

    public boolean isHighPriority() {
        return priority != null && priority >= 8;
    }

    public boolean isSystemRule() {
        return isSystemRule != null && isSystemRule;
    }

    public boolean needsApproval() {
        return requiresApproval != null && requiresApproval;
    }

    public void recordApplication(boolean success, String appliedBy) {
        this.applicationCount = (this.applicationCount == null ? 0L : this.applicationCount) + 1;
        this.lastAppliedAt = LocalDateTime.now();
        this.appliedBy = appliedBy;
        
        if (success) {
            this.successCount = (this.successCount == null ? 0L : this.successCount) + 1;
        } else {
            this.failureCount = (this.failureCount == null ? 0L : this.failureCount) + 1;
        }
    }

    public void recordAttempt() {
        this.lastApplicationAttemptAt = LocalDateTime.now();
    }

    public void approve(String approvedBy) {
        this.approvedBy = approvedBy;
        this.approvedAt = LocalDateTime.now();
    }

    public void incrementVersion() {
        this.version = (this.version == null ? 1 : this.version + 1);
    }

    public boolean hasConditions() {
        return conditions != null && !conditions.isEmpty();
    }

    public boolean hasActions() {
        return actions != null && !actions.isEmpty();
    }

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
