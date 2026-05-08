package com.everx.security.dto;

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
public class SecurityPolicyDto {
    private UUID id;
    private UUID tenantId;
    private String name;
    private String description;
    private PolicyType policyType;
    private EnforcementLevel enforcementLevel;
    private Boolean isEnabled;
    private Integer version;
    private Integer priority;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long violationCount;
    private LocalDateTime lastViolationAt;
    private Boolean autoBlockEnabled;
    private Boolean notificationEnabled;
    private Integer gracePeriodMinutes;
    private Integer cooldownPeriodMinutes;
    private String complianceFramework;
    private Double riskScoreThreshold;

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
