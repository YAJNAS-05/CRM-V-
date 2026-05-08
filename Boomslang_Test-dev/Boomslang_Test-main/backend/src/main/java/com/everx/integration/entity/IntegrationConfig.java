package com.everx.integration.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "integration_configs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IntegrationConfig {

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "integration_type", nullable = false)
    private IntegrationType integrationType;

    @Column(name = "source_system", nullable = false)
    private String sourceSystem;

    @Column(name = "target_system", nullable = false)
    private String targetSystem;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "connection_details")
    private Map<String, Object> connectionDetails;

    @Enumerated(EnumType.STRING)
    @Column(name = "authentication_type", nullable = false)
    private AuthenticationType authenticationType;

    @Column(name = "credentials", nullable = false)
    private String credentials;

    @Column(name = "sync_frequency")
    private String syncFrequency;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "data_mappings")
    private List<Map<String, Object>> dataMappings;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "transformation_rules")
    private List<Map<String, Object>> transformationRules;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "error_handling")
    private Map<String, Object> errorHandling;

    @Column(name = "retry_policy")
    private String retryPolicy;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "created_by", nullable = false)
    private String createdBy;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "last_sync_at")
    private LocalDateTime lastSyncAt;

    @Column(name = "next_sync_at")
    private LocalDateTime nextSyncAt;

    @Column(name = "sync_count")
    private Long syncCount;

    @Column(name = "success_count")
    private Long successCount;

    @Column(name = "failure_count")
    private Long failureCount;

    @Column(name = "estimated_duration")
    private Double estimatedDuration;

    @Column(name = "priority")
    private Integer priority;

    @Column(name = "is_active")
    private Boolean isActive;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata")
    private Map<String, Object> metadata;

    @Column(name = "tags")
    private List<String> tags;

    @Column(name = "category")
    private String category;

    @Column(name = "version")
    private Integer version;

    @Column(name = "health_status")
    private String healthStatus;

    @Column(name = "last_health_check_at")
    private LocalDateTime lastHealthCheckAt;

    // Helper methods
    public boolean isActive() {
        return Status.ACTIVE.equals(status) && (isActive == null || isActive);
    }

    public boolean isHealthy() {
        return "HEALTHY".equals(healthStatus) && lastHealthCheckAt != null && 
               lastHealthCheckAt.isAfter(LocalDateTime.now().minusHours(1));
    }

    public double getSuccessRate() {
        if (syncCount == null || syncCount == 0) {
            return 0.0;
        }
        return (double) (successCount == null ? 0L : successCount) / syncCount;
    }

    public void recordSync(boolean success) {
        this.syncCount = (this.syncCount == null ? 0L : this.syncCount) + 1;
        this.lastSyncAt = LocalDateTime.now();
        
        if (success) {
            this.successCount = (this.successCount == null ? 0L : this.successCount) + 1;
        } else {
            this.failureCount = (this.failureCount == null ? 0L : this.failureCount) + 1;
        }
    }

    public void updateHealthStatus(String status) {
        this.healthStatus = status;
        this.lastHealthCheckAt = LocalDateTime.now();
    }

    public boolean needsSync() {
        return nextSyncAt != null && LocalDateTime.now().isAfter(nextSyncAt);
    }

    public void scheduleNextSync() {
        if (syncFrequency != null) {
            // Parse sync frequency and set next sync time
            // This is simplified - in production would parse cron expressions
            this.nextSyncAt = LocalDateTime.now().plusHours(1);
        }
    }

    public boolean isHighPriority() {
        return priority != null && priority >= 8;
    }

    public void incrementVersion() {
        this.version = (this.version == null ? 1 : this.version + 1);
    }

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
