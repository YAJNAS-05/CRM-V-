package com.everx.integration.dto;

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
public class ExternalSystemDto {
    private UUID id;
    private UUID tenantId;
    private String name;
    private String description;
    private SystemType systemType;
    private String baseUrl;
    private String apiVersion;
    private AuthenticationType authenticationType;
    private Status status;
    private LocalDateTime lastHealthCheck;
    private HealthStatus healthStatus;
    private Long responseTime;
    private LocalDateTime createdAt;
    private Long connectionCount;
    private Double successRate;
    private Boolean isMonitored;

    public enum SystemType {
        DATABASE,
        API_SERVICE,
        MESSAGE_QUEUE,
        FILE_SYSTEM,
        CLOUD_SERVICE,
        LEGACY_SYSTEM,
        ERP_SYSTEM,
        CRM_SYSTEM,
        HR_SYSTEM,
        FINANCIAL_SYSTEM,
        EMAIL_SERVICE,
        SMS_SERVICE,
        WEBHOOK,
        CUSTOM
    }

    public enum AuthenticationType {
        NONE,
        BASIC_AUTH,
        API_KEY,
        OAUTH2,
        JWT,
        CERTIFICATE,
        SSH_KEY,
        CUSTOM,
        SAML,
        LDAP
    }

    public enum Status {
        ACTIVE,
        INACTIVE,
        MAINTENANCE,
        ERROR,
        DEPRECATED
    }

    public enum HealthStatus {
        HEALTHY,
        UNHEALTHY,
        UNKNOWN,
        MAINTENANCE,
        DEGRADED
    }
}
