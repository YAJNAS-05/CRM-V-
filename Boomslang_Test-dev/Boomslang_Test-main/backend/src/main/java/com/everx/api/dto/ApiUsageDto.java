package com.everx.api.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ApiUsageDto {
    private UUID id;
    private UUID apiKeyId;
    private UUID tenantId;
    private String endpoint;
    private String method;
    private Integer statusCode;
    private Long responseTimeMs;
    private Long requestSizeBytes;
    private Long responseSizeBytes;
    private String ipAddress;
    private String userAgent;
    private String requestId;
    private String errorMessage;
    private LocalDateTime timestamp;
    private String apiVersion;
    private Boolean isSuccess;
}
