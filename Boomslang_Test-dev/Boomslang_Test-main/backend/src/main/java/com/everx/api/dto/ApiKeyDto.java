package com.everx.api.dto;

import com.everx.api.entity.ApiKey;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ApiKeyDto {
    private UUID id;
    private String keyValue; // Masked
    private String name;
    private String description;
    private UUID tenantId;
    private UUID createdByUserId;
    private Boolean isActive;
    private LocalDateTime expiresAt;
    private LocalDateTime lastUsedAt;
    private Long usageCount;
    private Integer rateLimitPerMinute;
    private Integer rateLimitPerHour;
    private Integer rateLimitPerDay;
    private String allowedIps;
    private String allowedOrigins;
    private String permissions;
    private String apiVersion;
    private ApiKey.KeyType keyType;
    private Boolean isReadonly;
    private LocalDateTime revokedAt;
    private String revocationReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
