package com.everx.api.dto;

import com.everx.api.entity.ApiKey;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class CreateApiKeyRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 200, message = "Name must not exceed 200 characters")
    private String name;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    @NotNull(message = "Tenant ID is required")
    private UUID tenantId;

    @NotNull(message = "Created by user ID is required")
    private UUID createdByUserId;

    private LocalDateTime expiresAt;

    private Integer rateLimitPerMinute;

    private Integer rateLimitPerHour;

    private Integer rateLimitPerDay;

    private String allowedIps; // JSON array

    private String allowedOrigins; // JSON array

    private String permissions; // JSON array

    @Size(max = 20, message = "API version must not exceed 20 characters")
    private String apiVersion;

    private ApiKey.KeyType keyType;

    private Boolean isReadonly;
}
