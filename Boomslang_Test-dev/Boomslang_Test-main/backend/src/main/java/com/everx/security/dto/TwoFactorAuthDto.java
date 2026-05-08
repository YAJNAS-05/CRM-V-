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
public class TwoFactorAuthDto {
    private UUID id;
    private UUID tenantId;
    private String userId;
    private TwoFactorMethod method;
    private Boolean isEnabled;
    private String qrCodeUrl;
    private LocalDateTime createdAt;
    private LocalDateTime verifiedAt;
    private LocalDateTime lastUsedAt;
    private Integer backupCodesUsedCount;
    private Integer failedAttemptsCount;
    private LocalDateTime lockedUntil;
    private Boolean deviceTrusted;
    private LocalDateTime trustExpiresAt;

    public enum TwoFactorMethod {
        TOTP,        // Time-based One-Time Password
        SMS,         // SMS verification
        EMAIL,       // Email verification
        PUSH,        // Push notification
        HARDWARE     // Hardware token
    }
}
