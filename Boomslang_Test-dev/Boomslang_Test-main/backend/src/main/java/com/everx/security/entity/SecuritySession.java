package com.everx.security.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "security_sessions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SecuritySession {

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "session_token", nullable = false, unique = true)
    private String sessionToken;

    @Column(name = "refresh_token", nullable = false, unique = true)
    private String refreshToken;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "user_agent")
    private String userAgent;

    @Column(name = "device_fingerprint")
    private String deviceFingerprint;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "last_activity_at", nullable = false)
    private LocalDateTime lastActivityAt;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @Enumerated(EnumType.STRING)
    @Column(name = "session_type")
    private SessionType sessionType;

    @Column(name = "revoked_at")
    private LocalDateTime revokedAt;

    @Column(name = "revoked_by")
    private String revokedBy;

    @Column(name = "revocation_reason")
    private String revocationReason;

    @Column(name = "login_method")
    private String loginMethod;

    @Column(name = "mfa_verified")
    private Boolean mfaVerified;

    @Column(name = "mfa_verified_at")
    private LocalDateTime mfaVerifiedAt;

    @Column(name = "risk_score")
    private Double riskScore;

    @Column(name = "anomaly_detected")
    private Boolean anomalyDetected;

    @Column(name = "location")
    private String location;

    @Column(name = "device_type")
    private String deviceType;

    @Column(name = "browser")
    private String browser;

    @Column(name = "os")
    private String os;

    // Helper methods
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    public boolean isValid() {
        return isActive != null && isActive && !isExpired() && revokedAt == null;
    }

    public boolean isRevoked() {
        return revokedAt != null;
    }

    public boolean requiresMFA() {
        return mfaVerified == null || !mfaVerified;
    }

    public void verifyMFA() {
        this.mfaVerified = true;
        this.mfaVerifiedAt = LocalDateTime.now();
    }

    public void revoke(String revokedBy, String reason) {
        this.isActive = false;
        this.revokedAt = LocalDateTime.now();
        this.revokedBy = revokedBy;
        this.revocationReason = reason;
    }

    public void extendSession(int hours) {
        this.expiresAt = LocalDateTime.now().plusHours(hours);
        this.lastActivityAt = LocalDateTime.now();
    }

    public void updateActivity() {
        this.lastActivityAt = LocalDateTime.now();
    }

    public boolean isHighRisk() {
        return riskScore != null && riskScore > 0.7;
    }

    public boolean hasAnomaly() {
        return anomalyDetected != null && anomalyDetected;
    }

    public long getRemainingMinutes() {
        if (isExpired()) return 0;
        return java.time.Duration.between(LocalDateTime.now(), expiresAt).toMinutes();
    }

    public enum SessionType {
        WEB,
        MOBILE,
        API,
        DESKTOP,
        SSO,
        SERVICE_ACCOUNT
    }
}
