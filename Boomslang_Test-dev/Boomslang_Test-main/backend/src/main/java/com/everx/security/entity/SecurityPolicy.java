package com.everx.security.entity;

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
@Table(name = "security_policies")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SecurityPolicy {

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
    @Column(name = "policy_type", nullable = false)
    private PolicyType policyType;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "rules")
    private List<Map<String, Object>> rules;

    @Enumerated(EnumType.STRING)
    @Column(name = "enforcement_level", nullable = false)
    private EnforcementLevel enforcementLevel;

    @Column(name = "is_enabled", nullable = false)
    private Boolean isEnabled;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "created_by", nullable = false)
    private String createdBy;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "version", nullable = false)
    private Integer version;

    @Column(name = "priority")
    private Integer priority;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "conditions")
    private Map<String, Object> conditions;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "exceptions")
    private List<Map<String, Object>> exceptions;

    @Column(name = "violation_count")
    private Long violationCount;

    @Column(name = "last_violation_at")
    private LocalDateTime lastViolationAt;

    @Column(name = "auto_block_enabled")
    private Boolean autoBlockEnabled;

    @Column(name = "notification_enabled")
    private Boolean notificationEnabled;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "notification_recipients")
    private List<String> notificationRecipients;

    @Column(name = "grace_period_minutes")
    private Integer gracePeriodMinutes;

    @Column(name = "cooldown_period_minutes")
    private Integer cooldownPeriodMinutes;

    @Column(name = "compliance_framework")
    private String complianceFramework;

    @Column(name = "risk_score_threshold")
    private Double riskScoreThreshold;

    // Helper methods
    public boolean isActive() {
        return isEnabled != null && isEnabled;
    }

    public void recordViolation() {
        this.violationCount = (this.violationCount == null ? 0L : this.violationCount) + 1;
        this.lastViolationAt = LocalDateTime.now();
    }

    public boolean hasRecentViolations(int minutes) {
        return lastViolationAt != null && 
               lastViolationAt.isAfter(LocalDateTime.now().minusMinutes(minutes));
    }

    public boolean isInCooldown() {
        return cooldownPeriodMinutes != null && lastViolationAt != null &&
               lastViolationAt.isAfter(LocalDateTime.now().minusMinutes(cooldownPeriodMinutes));
    }

    public boolean isInGracePeriod() {
        return gracePeriodMinutes != null && lastViolationAt != null &&
               lastViolationAt.isAfter(LocalDateTime.now().minusMinutes(gracePeriodMinutes));
    }

    public boolean shouldAutoBlock() {
        return autoBlockEnabled != null && autoBlockEnabled && 
               !isInGracePeriod() && !isInCooldown();
    }

    public boolean shouldNotify() {
        return notificationEnabled != null && notificationEnabled && 
               notificationRecipients != null && !notificationRecipients.isEmpty();
    }

    public void incrementVersion() {
        this.version = this.version + 1;
        this.updatedAt = LocalDateTime.now();
    }

    public boolean exceedsRiskThreshold(Double riskScore) {
        return riskScoreThreshold != null && riskScore != null && 
               riskScore > riskScoreThreshold;
    }

    public boolean isHighPriority() {
        return priority != null && priority >= 8;
    }

    public boolean isComplianceRelated() {
        return complianceFramework != null && !complianceFramework.trim().isEmpty();
    }

    public enum PolicyType {
        PASSWORD_POLICY,
        ACCESS_CONTROL,
        SESSION_MANAGEMENT,
        DATA_PROTECTION,
        NETWORK_SECURITY,
        AUTHENTICATION,
        AUTHORIZATION,
        ENCRYPTION,
        AUDIT_LOGGING,
        INCIDENT_RESPONSE,
        BUSINESS_CONTINUITY,
        VENDOR_MANAGEMENT,
        COMPLIANCE
    }

    public enum EnforcementLevel {
        ADVISORY,    // Log only, no enforcement
        WARNING,     // Warn user but allow action
        SOFT_BLOCK,  // Block with override option
        HARD_BLOCK,  // Block completely
        CRITICAL     // Block and trigger incident response
    }
}
