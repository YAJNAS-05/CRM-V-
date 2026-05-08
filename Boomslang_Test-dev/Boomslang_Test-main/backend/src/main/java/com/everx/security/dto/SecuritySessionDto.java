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
public class SecuritySessionDto {
    private UUID id;
    private UUID tenantId;
    private String userId;
    private SessionType sessionType;
    private String ipAddress;
    private String userAgent;
    private String location;
    private String deviceType;
    private String browser;
    private String os;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private LocalDateTime lastActivityAt;
    private Boolean isActive;
    private Boolean mfaVerified;
    private LocalDateTime mfaVerifiedAt;
    private Double riskScore;
    private Boolean anomalyDetected;
    private Long remainingMinutes;

    public enum SessionType {
        WEB,
        MOBILE,
        API,
        DESKTOP,
        SSO,
        SERVICE_ACCOUNT
    }
}
