package com.everx.performance.entity;

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
@Table(name = "performance_alerts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PerformanceAlert {

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "metric_name", nullable = false)
    private String metricName;

    @Enumerated(EnumType.STRING)
    @Column(name = "alert_type", nullable = false)
    private AlertType alertType;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false)
    private Severity severity;

    @Column(name = "threshold_value", nullable = false)
    private Double thresholdValue;

    @Column(name = "actual_value", nullable = false)
    private Double actualValue;

    @Column(name = "condition", nullable = false)
    private String condition;

    @Column(name = "message", nullable = false)
    private String message;

    @Column(name = "description")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status;

    @Column(name = "triggered_at", nullable = false)
    private LocalDateTime triggeredAt;

    @Column(name = "acknowledged_at")
    private LocalDateTime acknowledgedAt;

    @Column(name = "acknowledged_by")
    private String acknowledgedBy;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "resolved_by")
    private String resolvedBy;

    @Column(name = "resolution_notes")
    private String resolutionNotes;

    @Column(name = "escalated_at")
    private LocalDateTime escalatedAt;

    @Column(name = "escalated_to")
    private String escalatedTo;

    @Column(name = "escalated_by")
    private String escalatedBy;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata")
    private Map<String, Object> metadata;

    @Column(name = "source")
    private String source;

    @Column(name = "host")
    private String host;

    @Column(name = "service")
    private String service;

    @Column(name = "endpoint")
    private String endpoint;

    @Column(name = "correlation_id")
    private String correlationId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "affected_resources")
    private List<String> affectedResources;

    @Column(name = "impact_level")
    private String impactLevel;

    @Column(name = "urgency")
    private String urgency;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "notification_sent")
    private Map<String, LocalDateTime> notificationSent;

    @Column(name = "auto_resolved")
    private Boolean autoResolved;

    @Column(name = "auto_resolution_reason")
    private String autoResolutionReason;

    @Column(name = "false_positive")
    private Boolean falsePositive;

    @Column(name = "false_positive_reason")
    private String falsePositiveReason;

    @Column(name = "assigned_to")
    private String assignedTo;

    @Column(name = "assigned_at")
    private LocalDateTime assignedAt;

    @Column(name = "due_date")
    private LocalDateTime dueDate;

    @Column(name = "tags")
    private List<String> tags;

    @Column(name = "category")
    private String category;

    // Helper methods
    public boolean isActive() {
        return Status.ACTIVE.equals(status);
    }

    public boolean isAcknowledged() {
        return acknowledgedAt != null;
    }

    public boolean isResolved() {
        return Status.RESOLVED.equals(status);
    }

    public boolean isEscalated() {
        return escalatedAt != null;
    }

    public boolean isCritical() {
        return Severity.CRITICAL.equals(severity);
    }

    public boolean isHighSeverity() {
        return Severity.HIGH.equals(severity) || isCritical();
    }

    public boolean isOverdue() {
        return dueDate != null && LocalDateTime.now().isAfter(dueDate) && !isResolved();
    }

    public boolean isFalsePositive() {
        return falsePositive != null && falsePositive;
    }

    public boolean isAutoResolved() {
        return autoResolved != null && autoResolved;
    }

    public boolean requiresEscalation() {
        return isHighSeverity() && !isAcknowledged() && 
               triggeredAt.isBefore(LocalDateTime.now().minusHours(1));
    }

    public void acknowledge(String acknowledgedBy) {
        this.acknowledgedAt = LocalDateTime.now();
        this.acknowledgedBy = acknowledgedBy;
    }

    public void resolve(String resolvedBy, String notes) {
        this.status = Status.RESOLVED;
        this.resolvedAt = LocalDateTime.now();
        this.resolvedBy = resolvedBy;
        this.resolutionNotes = notes;
    }

    public void autoResolve(String reason) {
        this.status = Status.RESOLVED;
        this.resolvedAt = LocalDateTime.now();
        this.autoResolved = true;
        this.autoResolutionReason = reason;
    }

    public void escalate(String escalatedTo, String escalatedBy) {
        this.escalatedAt = LocalDateTime.now();
        this.escalatedTo = escalatedTo;
        this.escalatedBy = escalatedBy;
    }

    public void markAsFalsePositive(String reason) {
        this.falsePositive = true;
        this.falsePositiveReason = reason;
        this.status = Status.FALSE_POSITIVE;
        this.resolvedAt = LocalDateTime.now();
    }

    public void assignTo(String assignedTo) {
        this.assignedTo = assignedTo;
        this.assignedAt = LocalDateTime.now();
    }

    public void recordNotification(String channel) {
        if (notificationSent == null) {
            notificationSent = new java.util.HashMap<>();
        }
        notificationSent.put(channel, LocalDateTime.now());
    }

    public boolean hasNotificationsSent() {
        return notificationSent != null && !notificationSent.isEmpty();
    }

    public long getDurationMinutes() {
        if (triggeredAt == null) return 0;
        LocalDateTime end = resolvedAt != null ? resolvedAt : LocalDateTime.now();
        return java.time.Duration.between(triggeredAt, end).toMinutes();
    }

    public boolean isLongRunning() {
        return getDurationMinutes() > 60; // More than 1 hour
    }

    public enum AlertType {
        THRESHOLD,      // Value exceeded threshold
        ANOMALY,        // Anomalous pattern detected
        TREND,          // Unusual trend
        AVAILABILITY,   // Service unavailable
        PERFORMANCE,    // Performance degradation
        CAPACITY,       // Capacity issues
        ERROR_RATE,     // High error rate
        LATENCY,        // High latency
        CUSTOM
    }

    public enum Severity {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL
    }

    public enum Status {
        ACTIVE,
        ACKNOWLEDGED,
        RESOLVED,
        FALSE_POSITIVE,
        SUPPRESSED
    }
}
