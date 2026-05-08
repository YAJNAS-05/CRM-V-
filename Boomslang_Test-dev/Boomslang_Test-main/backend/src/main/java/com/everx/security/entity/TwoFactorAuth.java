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
import java.util.UUID;

@Entity
@Table(name = "two_factor_auth")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TwoFactorAuth {

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "method", nullable = false)
    private TwoFactorMethod method;

    @Column(name = "secret_key", nullable = false)
    private String secretKey;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "backup_codes")
    private List<String> backupCodes;

    @Column(name = "is_enabled", nullable = false)
    private Boolean isEnabled;

    @Column(name = "qr_code_url")
    private String qrCodeUrl;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "last_used_at")
    private LocalDateTime lastUsedAt;

    @Column(name = "backup_codes_used_count")
    private Integer backupCodesUsedCount;

    @Column(name = "failed_attempts_count")
    private Integer failedAttemptsCount;

    @Column(name = "locked_until")
    private LocalDateTime lockedUntil;

    @Column(name = "device_trusted")
    private Boolean deviceTrusted;

    @Column(name = "trust_expires_at")
    private LocalDateTime trustExpiresAt;

    // Helper methods
    public boolean isLocked() {
        return lockedUntil != null && LocalDateTime.now().isBefore(lockedUntil);
    }

    public boolean isTrustValid() {
        return deviceTrusted != null && deviceTrusted && 
               trustExpiresAt != null && LocalDateTime.now().isBefore(trustExpiresAt);
    }

    public boolean hasBackupCodes() {
        return backupCodes != null && !backupCodes.isEmpty();
    }

    public void incrementFailedAttempts() {
        this.failedAttemptsCount = (this.failedAttemptsCount == null ? 0 : this.failedAttemptsCount) + 1;
        
        // Lock account after 5 failed attempts for 30 minutes
        if (this.failedAttemptsCount >= 5) {
            this.lockedUntil = LocalDateTime.now().plusMinutes(30);
        }
    }

    public void resetFailedAttempts() {
        this.failedAttemptsCount = 0;
        this.lockedUntil = null;
    }

    public void useBackupCode(String code) {
        if (backupCodes != null) {
            backupCodes.remove(code);
            this.backupCodesUsedCount = (this.backupCodesUsedCount == null ? 0 : this.backupCodesUsedCount) + 1;
        }
    }

    public void trustDevice(int days) {
        this.deviceTrusted = true;
        this.trustExpiresAt = LocalDateTime.now().plusDays(days);
    }

    public void revokeTrust() {
        this.deviceTrusted = false;
        this.trustExpiresAt = null;
    }

    public enum TwoFactorMethod {
        TOTP,        // Time-based One-Time Password
        SMS,         // SMS verification
        EMAIL,       // Email verification
        PUSH,        // Push notification
        HARDWARE     // Hardware token
    }
}
