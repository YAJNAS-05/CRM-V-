package com.everx.api.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UpdateApiKeyRequest {

    @Size(max = 200, message = "Name must not exceed 200 characters")
    private String name;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    private LocalDateTime expiresAt;

    private Integer rateLimitPerMinute;

    private Integer rateLimitPerHour;

    private Integer rateLimitPerDay;

    private String allowedIps; // JSON array

    private String allowedOrigins; // JSON array

    private String permissions; // JSON array

    @Size(max = 20, message = "API version must not exceed 20 characters")
    private String apiVersion;

    private Boolean isActive;
}
