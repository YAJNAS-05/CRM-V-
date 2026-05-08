package com.everx.security.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SecurityAnalyticsDto {
    private UUID tenantId;
    private Map<String, Object> sessionMetrics;
    private Map<String, Object> twoFactorMetrics;
    private Map<String, Object> ssoMetrics;
    private Map<String, Object> securityEventMetrics;
    private LocalDateTime generatedAt;
}
