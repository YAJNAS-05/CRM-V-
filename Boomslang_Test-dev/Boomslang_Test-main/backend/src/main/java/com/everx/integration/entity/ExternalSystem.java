package com.everx.integration.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "external_systems")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExternalSystem {

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
    @Column(name = "system_type", nullable = false)
    private SystemType systemType;

    @Column(name = "base_url", nullable = false)
    private String baseUrl;

    @Column(name = "api_version")
    private String apiVersion;

    @Enumerated(EnumType.STRING)
    @Column(name = "authentication_type", nullable = false)
    private AuthenticationType authenticationType;

    @Column(name = "credentials", nullable = false)
    private String credentials;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "connection_details")
    private Map<String, Object> connectionDetails;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status;

    @Column(name = "last_health_check")
    private LocalDateTime lastHealthCheck;

    @Enumerated(EnumType.STRING)
    @Column(name = "health_status")
    private HealthStatus healthStatus;

    @Column(name = "health_message")
    private String healthMessage;

    @Column(name = "response_time")
    private Long responseTime;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "created_by", nullable = false)
    private String createdBy;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "connection_count")
    private Long connectionCount;

    @Column(name = "active_connections")
    private Long activeConnections;

    @Column(name = "last_connection_at")
    private LocalDateTime lastConnectionAt;

    @Column(name = "error_count")
    private Long errorCount;

    @Column(name = "last_error_at")
    private LocalDateTime lastErrorAt;

    @Column(name = "last_error_message")
    private String lastErrorMessage;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "capabilities")
    private Map<String, Object> capabilities;

    @Column(name = "rate_limit_per_hour")
    private Integer rateLimitPerHour;

    @Column(name = "timeout_seconds")
    private Integer timeoutSeconds;

    @Column(name = "retry_attempts")
    private Integer retryAttempts;

    @Column(name = "is_monitored")
    private Boolean isMonitored;

    @Column(name = "monitoring_interval_minutes")
    private Integer monitoringIntervalMinutes;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata")
    private Map<String, Object> metadata;

    @Column(name = "tags")
    private String tags;

    @Column(name = "category")
    private String category;

    @Column(name = "environment")
    private String environment;

    @Column(name = "owner")
    private String owner;

    @Column(name = "support_contact")
    private String supportContact;

    // Helper methods
    public boolean isActive() {
        return Status.ACTIVE.equals(status);
    }

    public boolean isHealthy() {
        return HealthStatus.HEALTHY.equals(healthStatus) && lastHealthCheck != null && 
               lastHealthCheck.isAfter(LocalDateTime.now().minusHours(1));
    }

    public boolean isUnhealthy() {
        return HealthStatus.UNHEALTHY.equals(healthStatus);
    }

    public boolean needsHealthCheck() {
        return isMonitored != null && isMonitored && 
               (lastHealthCheck == null || 
                lastHealthCheck.isBefore(LocalDateTime.now().minusMinutes(
                        monitoringIntervalMinutes == null ? 30 : monitoringIntervalMinutes)));
    }

    public void recordConnection() {
        this.connectionCount = (this.connectionCount == null ? 0L : this.connectionCount) + 1;
        this.lastConnectionAt = LocalDateTime.now();
        this.activeConnections = (this.activeConnections == null ? 0L : this.activeConnections) + 1;
    }

    public void releaseConnection() {
        if (this.activeConnections != null && this.activeConnections > 0) {
            this.activeConnections--;
        }
    }

    public void recordError(String errorMessage) {
        this.errorCount = (this.errorCount == null ? 0L : this.errorCount) + 1;
        this.lastErrorAt = LocalDateTime.now();
        this.lastErrorMessage = errorMessage;
    }

    public void updateHealthStatus(HealthStatus status, String message, Long responseTime) {
        this.healthStatus = status;
        this.healthMessage = message;
        this.responseTime = responseTime;
        this.lastHealthCheck = LocalDateTime.now();
    }

    public double getSuccessRate() {
        if (connectionCount == null || connectionCount == 0) {
            return 0.0;
        }
        long errors = errorCount == null ? 0L : errorCount;
        return Math.max(0.0, (double) (connectionCount - errors) / connectionCount);
    }

    public boolean hasRecentErrors() {
        return lastErrorAt != null && lastErrorAt.isAfter(LocalDateTime.now().minusHours(1));
    }

    public boolean isAtRateLimit() {
        // Simplified rate limiting check
        return rateLimitPerHour != null && connectionCount != null && 
               connectionCount >= rateLimitPerHour && 
               lastConnectionAt != null && 
               lastConnectionAt.isAfter(LocalDateTime.now().minusHours(1));
    }

    public boolean hasTimeout() {
        return timeoutSeconds != null && responseTime != null && 
               responseTime > (timeoutSeconds * 1000L);
    }

    public boolean canRetry() {
        return retryAttempts == null || errorCount == null || 
               errorCount < retryAttempts;
    }

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
