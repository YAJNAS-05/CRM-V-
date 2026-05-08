package com.everx.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.UUID;

@Data
public class ApiUsageRecordRequest {

    private UUID apiKeyId;

    @NotNull(message = "Tenant ID is required")
    private UUID tenantId;

    @NotBlank(message = "Endpoint is required")
    @Size(max = 500, message = "Endpoint must not exceed 500 characters")
    private String endpoint;

    @NotBlank(message = "Method is required")
    @Size(max = 10, message = "Method must not exceed 10 characters")
    private String method;

    @NotNull(message = "Status code is required")
    private Integer statusCode;

    @NotNull(message = "Response time is required")
    private Long responseTimeMs;

    private Long requestSizeBytes;

    private Long responseSizeBytes;

    @Size(max = 45, message = "IP address must not exceed 45 characters")
    private String ipAddress;

    @Size(max = 500, message = "User agent must not exceed 500 characters")
    private String userAgent;

    @Size(max = 100, message = "Request ID must not exceed 100 characters")
    private String requestId;

    @Size(max = 1000, message = "Error message must not exceed 1000 characters")
    private String errorMessage;

    @Size(max = 20, message = "API version must not exceed 20 characters")
    private String apiVersion;
}
