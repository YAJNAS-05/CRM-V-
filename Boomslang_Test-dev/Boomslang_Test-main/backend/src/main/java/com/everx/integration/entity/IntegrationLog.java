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
@Table(name = "integration_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IntegrationLog {

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "event_type", nullable = false)
    private String eventType;

    @Column(name = "description")
    private String description;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false)
    private Severity severity;

    @Column(name = "integration_id")
    private UUID integrationId;

    @Column(name = "execution_id")
    private UUID executionId;

    @Column(name = "system_name")
    private String systemName;

    @Column(name = "operation")
    private String operation;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "details")
    private Map<String, Object> details;

    @Column(name = "source_system")
    private String sourceSystem;

    @Column(name = "target_system")
    private String targetSystem;

    @Column(name = "correlation_id")
    private String correlationId;

    @Column(name = "user_id")
    private String userId;

    @Column(name = "session_id")
    private String sessionId;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "user_agent")
    private String userAgent;

    @Column(name = "duration_ms")
    private Long durationMs;

    @Column(name = "status_code")
    private Integer statusCode;

    @Column(name = "error_code")
    private String errorCode;

    @Column(name = "error_message")
    private String errorMessage;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "request_data")
    private Map<String, Object> requestData;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "response_data")
    private Map<String, Object> responseData;

    @Column(name = "record_count")
    private Long recordCount;

    @Column(name = "data_volume_bytes")
    private Long dataVolumeBytes;

    @Column(name = "retry_attempt")
    private Integer retryAttempt;

    @Column(name = "is_resolved")
    private Boolean isResolved;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "resolved_by")
    private String resolvedBy;

    @Column(name = "resolution_notes")
    private String resolutionNotes;

    @Column(name = "requires_action")
    private Boolean requiresAction;

    @Column(name = "action_taken")
    private Boolean actionTaken;

    @Column(name = "action_taken_at")
    private LocalDateTime actionTakenAt;

    @Column(name = "action_taken_by")
    private String actionTakenBy;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata")
    private Map<String, Object> metadata;

    // Helper methods
    public boolean isError() {
        return Severity.ERROR.equals(severity);
    }

    public boolean isWarning() {
        return Severity.WARNING.equals(severity);
    }

    public boolean isInfo() {
        return Severity.INFO.equals(severity);
    }

    public boolean isDebug() {
        return Severity.DEBUG.equals(severity);
    }

    public boolean isCritical() {
        return Severity.CRITICAL.equals(severity);
    }

    public boolean isUnresolved() {
        return isResolved == null || !isResolved;
    }

    public boolean requiresAction() {
        return requiresAction != null && requiresAction && 
               (actionTaken == null || !actionTaken);
    }

    public void resolve(String resolvedBy, String notes) {
        this.isResolved = true;
        this.resolvedAt = LocalDateTime.now();
        this.resolvedBy = resolvedBy;
        this.resolutionNotes = notes;
    }

    public void takeAction(String actionBy) {
        this.actionTaken = true;
        this.actionTakenAt = LocalDateTime.now();
        this.actionTakenBy = actionBy;
    }

    public boolean hasError() {
        return errorMessage != null && !errorMessage.trim().isEmpty();
    }

    public boolean hasData() {
        return (requestData != null && !requestData.isEmpty()) || 
               (responseData != null && !responseData.isEmpty());
    }

    public boolean isSlowOperation() {
        return durationMs != null && durationMs > 5000; // 5 seconds threshold
    }

    public boolean isHighVolume() {
        return dataVolumeBytes != null && dataVolumeBytes > 10 * 1024 * 1024; // 10MB threshold
    }

    public boolean isRecent() {
        return timestamp.isAfter(LocalDateTime.now().minusHours(24));
    }

    public enum Severity {
        DEBUG,
        INFO,
        WARNING,
        ERROR,
        CRITICAL
    }
}
