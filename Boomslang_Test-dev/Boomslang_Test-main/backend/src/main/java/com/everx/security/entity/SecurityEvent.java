package com.everx.security.entity;

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
@Table(name = "security_events")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SecurityEvent {

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "user_id")
    private String userId;

    @Column(name = "event_type", nullable = false)
    private String eventType;

    @Column(name = "description")
    private String description;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false)
    private Severity severity;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "user_agent")
    private String userAgent;

    @Column(name = "session_id")
    private String sessionId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata")
    private Map<String, Object> metadata;

    @Column(name = "source_system")
    private String sourceSystem;

    @Column(name = "correlation_id")
    private String correlationId;

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
    @Column(name = "affected_resources")
    private Map<String, Object> affectedResources;

    @Column(name = "threat_level")
    private String threatLevel;

    @Column(name = "investigation_status")
    private String investigationStatus;

    @Column(name = "assigned_to")
    private String assignedTo;

    @Column(name = "escalated")
    private Boolean escalated;

    @Column(name = "escalated_at")
    private LocalDateTime escalatedAt;

    @Column(name = "escalated_to")
    private String escalatedTo;

    // Helper methods
    public boolean isHighSeverity() {
        return Severity.HIGH.equals(severity) || Severity.CRITICAL.equals(severity);
    }

    public boolean isPendingAction() {
        return requiresAction != null && requiresAction && 
               (actionTaken == null || !actionTaken);
    }

    public boolean isUnresolved() {
        return isResolved == null || !isResolved;
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

    public void escalate(String escalatedTo) {
        this.escalated = true;
        this.escalatedAt = LocalDateTime.now();
        this.escalatedTo = escalatedTo;
    }

    public void assignTo(String assignedTo) {
        this.assignedTo = assignedTo;
    }

    public boolean requiresEscalation() {
        return isHighSeverity() && isUnresolved() && 
               timestamp.isBefore(LocalDateTime.now().minusHours(1));
    }

    public enum Severity {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL
    }
}
