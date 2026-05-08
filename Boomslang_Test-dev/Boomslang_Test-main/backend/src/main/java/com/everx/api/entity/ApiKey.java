package com.everx.api.entity;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "api_keys", schema = "everx_api")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class ApiKey extends BaseEntity {

    @Column(name = "key_value", nullable = false, unique = true, length = 100)
    private String keyValue;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "created_by_user_id", nullable = false)
    private UUID createdByUserId;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "last_used_at")
    private LocalDateTime lastUsedAt;

    @Column(name = "usage_count", nullable = false)
    @Builder.Default
    private Long usageCount = 0L;

    @Column(name = "rate_limit_per_minute", nullable = false)
    @Builder.Default
    private Integer rateLimitPerMinute = 100;

    @Column(name = "rate_limit_per_hour", nullable = false)
    @Builder.Default
    private Integer rateLimitPerHour = 1000;

    @Column(name = "rate_limit_per_day", nullable = false)
    @Builder.Default
    private Integer rateLimitPerDay = 10000;

    @Column(name = "allowed_ips", columnDefinition = "TEXT")
    private String allowedIps; // JSON array of allowed IPs

    @Column(name = "allowed_origins", columnDefinition = "TEXT")
    private String allowedOrigins; // JSON array of allowed origins

    @Column(name = "permissions", columnDefinition = "TEXT")
    private String permissions; // JSON array of allowed permissions

    @Column(name = "api_version", nullable = false, length = 20)
    @Builder.Default
    private String apiVersion = "v1";

    @Column(name = "key_type", nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private KeyType keyType = KeyType.STANDARD;

    @Column(name = "is_readonly", nullable = false)
    @Builder.Default
    private Boolean isReadonly = false;

    @Column(name = "revoked_at")
    private LocalDateTime revokedAt;

    @Column(name = "revocation_reason", columnDefinition = "TEXT")
    private String revocationReason;

    public enum KeyType {
        STANDARD, ADMIN, READONLY, WEBHOOK, INTEGRATION
    }

    // Helper methods
    public boolean isExpired() {
        return expiresAt != null && expiresAt.isBefore(LocalDateTime.now());
    }

    public boolean isRevoked() {
        return revokedAt != null;
    }

    public boolean isValid() {
        return isActive && !isExpired() && !isRevoked();
    }

    public void recordUsage() {
        this.lastUsedAt = LocalDateTime.now();
        this.usageCount++;
    }

    public boolean hasPermission(String permission) {
        if (permissions == null) return false;
        return permissions.contains("\"" + permission + "\"");
    }

    public boolean isIpAllowed(String ip) {
        if (allowedIps == null || allowedIps.equals("[]")) return true;
        return allowedIps.contains("\"" + ip + "\"");
    }

    public boolean isOriginAllowed(String origin) {
        if (allowedOrigins == null || allowedOrigins.equals("[]")) return true;
        return allowedOrigins.contains("\"" + origin + "\"");
    }

    public String getMaskedKey() {
        if (keyValue == null || keyValue.length() < 8) return keyValue;
        return keyValue.substring(0, 4) + "****" + keyValue.substring(keyValue.length() - 4);
    }

    public void revoke(String reason) {
        this.revokedAt = LocalDateTime.now();
        this.revocationReason = reason;
        this.isActive = false;
    }
}
