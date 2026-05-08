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
public class IntegrationConfigDto {
    private UUID id;
    private UUID tenantId;
    private String name;
    private String description;
    private IntegrationType integrationType;
    private String sourceSystem;
    private String targetSystem;
    private AuthenticationType authenticationType;
    private String syncFrequency;
    private Status status;
    private LocalDateTime createdAt;
    private LocalDateTime lastSyncAt;
    private Long syncCount;
    private Double successRate;
    private String healthStatus;
    private Boolean isActive;

    public enum IntegrationType {
        DATABASE,
        API,
        FILE_TRANSFER,
        MESSAGE_QUEUE,
        WEBHOOK,
        EVENT_STREAM,
        BATCH_PROCESS,
        REAL_TIME_SYNC,
        CLOUD_SERVICE,
        LEGACY_SYSTEM,
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
        PAUSED,
        ERROR,
        MAINTENANCE,
        ARCHIVED
    }
}
