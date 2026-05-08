package com.everx.compliance.entity;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "audit_trails", schema = "everx_compliance")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class AuditTrail extends BaseEntity {

    @Column(name = "tenant_id", nullable = false)
    private java.util.UUID tenantId;

    @Column(name = "user_id", length = 200)
    private String userId;

    @Column(name = "event_type", nullable = false, length = 100)
    private String eventType;

    @Column(name = "entity_type", length = 100)
    private String entityType;

    @Column(name = "entity_id")
    private java.util.UUID entityId;

    @Column(name = "action", nullable = false, length = 100)
    private String action;

    @Column(name = "old_value", columnDefinition = "TEXT")
    private String oldValue;

    @Column(name = "new_value", columnDefinition = "TEXT")
    private String newValue;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "session_id", length = 200)
    private String sessionId;

    @Column(name = "risk_score", nullable = false)
    @Builder.Default
    private Double riskScore = 1.0;

    @ElementCollection
    @CollectionTable(name = "audit_compliance_flags", schema = "everx_compliance", joinColumns = @JoinColumn(name = "audit_id"))
    @Column(name = "flag")
    private List<String> complianceFlags;

    @Column(name = "source_system", length = 100)
    private String sourceSystem;

    @Column(name = "correlation_id", length = 200)
    private String correlationId;

    @Column(name = "parent_event_id")
    private java.util.UUID parentEventId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_event_id", insertable = false, updatable = false)
    private AuditTrail parentEvent;

    @Column(name = "batch_id", length = 200)
    private String batchId;

    @Column(name = "is_sensitive", nullable = false)
    @Builder.Default
    private Boolean isSensitive = false;

    @Column(name = "is_reversible", nullable = false)
    @Builder.Default
    private Boolean isReversible = true;

    @Column(name = "reversed_at")
    private LocalDateTime reversedAt;

    @Column(name = "reversed_by")
    private String reversedBy;

    @Column(name = "retention_days")
    private Integer retentionDays;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "archived_at")
    private LocalDateTime archivedAt;

    @Column(name = "review_status", nullable = false, length = 20)
    @Builder.Default
    private String reviewStatus = "PENDING";

    @Column(name = "reviewed_by")
    private String reviewedBy;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "review_notes", columnDefinition = "TEXT")
    private String reviewNotes;

    // Event types
    public static final String TYPE_CREATE = "CREATE";
    public static final String TYPE_UPDATE = "UPDATE";
    public static final String TYPE_DELETE = "DELETE";
    public static final String TYPE_READ = "READ";
    public static final String TYPE_EXPORT = "EXPORT";
    public static final String TYPE_IMPORT = "IMPORT";
    public static final String TYPE_LOGIN = "LOGIN";
    public static final String TYPE_LOGOUT = "LOGOUT";
    public static final String TYPE_ADMIN = "ADMIN";
    public static final String TYPE_SECURITY = "SECURITY";
    public static final String TYPE_COMPLIANCE = "COMPLIANCE";

    // Helper methods
    public boolean isCreateEvent() {
        return TYPE_CREATE.equals(eventType);
    }

    public boolean isUpdateEvent() {
        return TYPE_UPDATE.equals(eventType);
    }

    public boolean isDeleteEvent() {
        return TYPE_DELETE.equals(eventType);
    }

    public boolean isReadEvent() {
        return TYPE_READ.equals(eventType);
    }

    public boolean isExportEvent() {
        return TYPE_EXPORT.equals(eventType);
    }

    public boolean isImportEvent() {
        return TYPE_IMPORT.equals(eventType);
    }

    public boolean isLoginEvent() {
        return TYPE_LOGIN.equals(eventType);
    }

    public boolean isLogoutEvent() {
        return TYPE_LOGOUT.equals(eventType);
    }

    public boolean isAdminEvent() {
        return TYPE_ADMIN.equals(eventType);
    }

    public boolean isSecurityEvent() {
        return TYPE_SECURITY.equals(eventType);
    }

    public boolean isComplianceEvent() {
        return TYPE_COMPLIANCE.equals(eventType);
    }

    public boolean isSensitive() {
        return isSensitive;
    }

    public boolean isReversible() {
        return isReversible;
    }

    public boolean isReversed() {
        return reversedAt != null;
    }

    public boolean isExpired() {
        return expiresAt != null && LocalDateTime.now().isAfter(expiresAt);
    }

    public boolean isArchived() {
        return archivedAt != null;
    }

    public boolean isHighRisk() {
        return riskScore >= 7.0;
    }

    public boolean isMediumRisk() {
        return riskScore >= 4.0 && riskScore < 7.0;
    }

    public boolean isLowRisk() {
        return riskScore < 4.0;
    }

    public boolean hasComplianceFlags() {
        return complianceFlags != null && !complianceFlags.isEmpty();
    }

    public boolean hasParentEvent() {
        return parentEventId != null;
    }

    public boolean isBatchEvent() {
        return batchId != null;
    }

    public void markAsSensitive() {
        this.isSensitive = true;
    }

    public void markAsNotReversible() {
        this.isReversible = false;
    }

    public void reverseEvent(String reversedBy) {
        if (isReversible && !isReversed()) {
            this.reversedAt = LocalDateTime.now();
            this.reversedBy = reversedBy;
        }
    }

    public void setExpiration(Integer days) {
        this.retentionDays = days;
        this.expiresAt = LocalDateTime.now().plusDays(days);
    }

    public void archive() {
        this.archivedAt = LocalDateTime.now();
    }

    public void markAsReviewed(String reviewedBy, String notes) {
        this.reviewStatus = "REVIEWED";
        this.reviewedBy = reviewedBy;
        this.reviewedAt = LocalDateTime.now();
        this.reviewNotes = notes;
    }

    public String getRiskLevel() {
        if (isHighRisk()) return "HIGH";
        if (isMediumRisk()) return "MEDIUM";
        return "LOW";
    }

    public String getEventSummary() {
        return String.format("[%s] %s %s - %s - Risk: %s", 
                eventType, action, entityType, getRiskLevel(), riskScore);
    }

    public boolean requiresReview() {
        return isHighRisk() || isSensitive() || hasComplianceFlags();
    }

    public boolean isPendingReview() {
        return "PENDING".equals(reviewStatus);
    }

    public boolean isReviewed() {
        return "REVIEWED".equals(reviewStatus);
    }

    public String getRetentionStatus() {
        if (isExpired()) return "EXPIRED";
        if (isArchived()) return "ARCHIVED";
        if (expiresAt != null) {
            long daysUntilExpiry = java.time.Duration.between(LocalDateTime.now(), expiresAt).toDays();
            if (daysUntilExpiry <= 30) return "EXPIRING_SOON";
        }
        return "ACTIVE";
    }

    public boolean needsAttention() {
        return requiresReview() && isPendingReview();
    }

    public String getComplianceSummary() {
        if (!hasComplianceFlags()) return "No compliance flags";
        return String.join(", ", complianceFlags);
    }

    public boolean isDataModificationEvent() {
        return isCreateEvent() || isUpdateEvent() || isDeleteEvent();
    }

    public boolean isDataAccessEvent() {
        return isReadEvent() || isExportEvent();
    }

    public boolean isAuthenticationEvent() {
        return isLoginEvent() || isLogoutEvent();
    }

    public boolean isPrivilegedEvent() {
        return isAdminEvent() || isSecurityEvent() || isComplianceEvent();
    }

    public String getEventCategory() {
        if (isDataModificationEvent()) return "DATA_MODIFICATION";
        if (isDataAccessEvent()) return "DATA_ACCESS";
        if (isAuthenticationEvent()) return "AUTHENTICATION";
        if (isPrivilegedEvent()) return "PRIVILEGED";
        return "GENERAL";
    }

    public boolean shouldAlert() {
        return isHighRisk() || isSensitive() || isPrivilegedEvent();
    }

    public String getAlertReason() {
        List<String> reasons = new ArrayList<>();
        if (isHighRisk()) reasons.add("High risk");
        if (isSensitive()) reasons.add("Sensitive data");
        if (isPrivilegedEvent()) reasons.add("Privileged operation");
        return String.join(", ", reasons);
    }

    public boolean isRecent() {
        return timestamp != null && timestamp.isAfter(LocalDateTime.now().minusMinutes(5));
    }

    public String getTimeAgo() {
        if (timestamp == null) return "Unknown";
        LocalDateTime now = LocalDateTime.now();
        long minutes = java.time.Duration.between(timestamp, now).toMinutes();
        
        if (minutes < 1) return "Just now";
        if (minutes < 60) return minutes + "m ago";
        long hours = minutes / 60;
        if (hours < 24) return hours + "h ago";
        long days = hours / 24;
        return days + "d ago";
    }

    public String getFullDescription() {
        return String.format("%s %s on %s %s by %s from %s", 
                action, eventType, entityType, entityId, userId, ipAddress);
    }

    public boolean hasValueChanged() {
        return oldValue != null && newValue != null && !oldValue.equals(newValue);
    }

    public String getChangeSummary() {
        if (!hasValueChanged()) return "No change";
        return String.format("Changed from '%s' to '%s'", oldValue, newValue);
    }

    public boolean isFromInternalIP() {
        return ipAddress != null && (ipAddress.startsWith("192.168.") || 
                                      ipAddress.startsWith("10.") || 
                                      ipAddress.startsWith("172."));
    }

    public boolean isFromExternalIP() {
        return !isFromInternalIP();
    }

    public String getLocationType() {
        if (isFromInternalIP()) return "Internal";
        return "External";
    }

    public boolean isUnusualAccess() {
        return isFromExternalIP() && isPrivilegedEvent();
    }

    public String getSecurityContext() {
        return String.format("User: %s, IP: %s, Session: %s, Risk: %s", 
                userId, ipAddress, sessionId, getRiskLevel());
    }

    public boolean needsInvestigation() {
        return isHighRisk() && (isUnusualAccess() || hasComplianceFlags());
    }

    public String getInvestigationReason() {
        List<String> reasons = new ArrayList<>();
        if (isHighRisk()) reasons.add("High risk score");
        if (isUnusualAccess()) reasons.add("Unusual access pattern");
        if (hasComplianceFlags()) reasons.add("Compliance flags");
        return String.join(", ", reasons);
    }

    public boolean canBeRetained() {
        return !isExpired() && !isArchived();
    }

    public boolean shouldAutoArchive() {
        return isExpired() || (retentionDays != null && 
               timestamp != null && 
               timestamp.isBefore(LocalDateTime.now().minusDays(retentionDays)));
    }

    public String getRetentionInfo() {
        if (retentionDays == null) return "No retention policy";
        if (expiresAt == null) return "No expiration set";
        return String.format("Expires: %s (%d days)", expiresAt.toLocalDate(), retentionDays);
    }

    public boolean isCompliant() {
        return !hasComplianceFlags() && !isHighRisk();
    }

    public String getComplianceStatus() {
        if (!isCompliant()) return "NON_COMPLIANT";
        return "COMPLIANT";
    }

    public boolean affectsCompliance() {
        return hasComplianceFlags() || isSensitive() || isPrivilegedEvent();
    }

    public String getComplianceImpact() {
        if (!affectsCompliance()) return "No impact";
        List<String> impacts = new ArrayList<>();
        if (hasComplianceFlags()) impacts.add("Compliance flags");
        if (isSensitive()) impacts.add("Sensitive data");
        if (isPrivilegedEvent()) impacts.add("Privileged access");
        return String.join(", ", impacts);
    }

    public boolean isBusinessCritical() {
        return isHighRisk() || isSensitive() || isPrivilegedEvent();
    }

    public String getBusinessImpact() {
        if (!isBusinessCritical()) return "Low";
        if (isHighRisk()) return "High";
        if (isSensitive()) return "Medium";
        return "Medium";
    }

    public boolean requiresEscalation() {
        return isHighRisk() && (isSensitive() || isPrivilegedEvent());
    }

    public String getEscalationReason() {
        if (!requiresEscalation()) return "No escalation needed";
        return "High risk sensitive/privileged operation";
    }

    public String getAuditTrail() {
        return String.format("Event: %s, User: %s, Time: %s, IP: %s, Risk: %s, Flags: %s", 
                eventType, userId, timestamp, ipAddress, getRiskLevel(), getComplianceSummary());
    }

    public boolean isComplete() {
        return userId != null && eventType != null && action != null && timestamp != null;
    }

    public String getCompletenessStatus() {
        if (isComplete()) return "Complete";
        List<String> missing = new ArrayList<>();
        if (userId == null) missing.add("user");
        if (eventType == null) missing.add("event type");
        if (action == null) missing.add("action");
        if (timestamp == null) missing.add("timestamp");
        return "Missing: " + String.join(", ", missing);
    }

    public boolean isValid() {
        return isComplete() && riskScore >= 1.0 && riskScore <= 10.0;
    }

    public String getValidationStatus() {
        if (isValid()) return "Valid";
        if (!isComplete()) return "Incomplete";
        return "Invalid";
    }

    public String getQualityScore() {
        int score = 0;
        if (isComplete()) score += 3;
        if (hasComplianceFlags()) score += 2;
        if (ipAddress != null) score += 1;
        if (userAgent != null) score += 1;
        if (sessionId != null) score += 1;
        if (correlationId != null) score += 1;
        
        if (score >= 8) return "Excellent";
        if (score >= 6) return "Good";
        if (score >= 4) return "Fair";
        return "Poor";
    }

    public boolean isHighQuality() {
        return "Excellent".equals(getQualityScore()) || "Good".equals(getQualityScore());
    }

    public String getAuditQuality() {
        return String.format("Quality: %s, Completeness: %s, Validation: %s", 
                getQualityScore(), getCompletenessStatus(), getValidationStatus());
    }

    public boolean shouldBeIndexed() {
        return isHighRisk() || isSensitive() || isPrivilegedEvent();
    }

    public String getSearchPriority() {
        if (shouldBeIndexed()) return "High";
        if (isMediumRisk()) return "Medium";
        return "Low";
    }

    public boolean isSearchable() {
        return isComplete() && isValid();
    }

    public String getSearchability() {
        if (isSearchable()) return "Searchable";
        return "Not searchable";
    }

    public String getAuditMetadata() {
        return String.format("Source: %s, Correlation: %s, Batch: %s, Parent: %s", 
                sourceSystem, correlationId, batchId, parentEventId);
    }

    public boolean hasMetadata() {
        return sourceSystem != null || correlationId != null || batchId != null || parentEventId != null;
    }

    public String getMetadataSummary() {
        if (!hasMetadata()) return "No metadata";
        List<String> metadata = new ArrayList<>();
        if (sourceSystem != null) metadata.add("source");
        if (correlationId != null) metadata.add("correlation");
        if (batchId != null) metadata.add("batch");
        if (parentEventId != null) metadata.add("parent");
        return String.join(", ", metadata);
    }

    public boolean isRelatedTo(AuditTrail other) {
        if (other == null) return false;
        return this.correlationId != null && this.correlationId.equals(other.correlationId) ||
               this.batchId != null && this.batchId.equals(other.batchId) ||
               this.parentEventId != null && this.parentEventId.equals(other.getId()) ||
               other.parentEventId != null && other.parentEventId.equals(this.getId());
    }

    public String getRelationshipInfo() {
        if (!hasMetadata()) return "No relationships";
        List<String> relationships = new ArrayList<>();
        if (correlationId != null) relationships.add("Correlated events");
        if (batchId != null) relationships.add("Batch events");
        if (parentEventId != null) relationships.add("Parent event");
        return String.join(", ", relationships);
    }

    public boolean isPartOfSequence() {
        return correlationId != null || batchId != null;
    }

    public String getSequenceType() {
        if (correlationId != null) return "Correlation";
        if (batchId != null) return "Batch";
        return "Individual";
    }

    public String getAuditContext() {
        return String.format("Context: %s, Type: %s, Category: %s, Risk: %s", 
                getEventCategory(), eventType, getEventCategory(), getRiskLevel());
    }

    public boolean requiresMonitoring() {
        return isHighRisk() || isSensitive() || isPrivilegedEvent() || hasComplianceFlags();
    }

    public String getMonitoringLevel() {
        if (requiresMonitoring()) return "Active";
        return "Passive";
    }

    public String getMonitoringReason() {
        if (!requiresMonitoring()) return "No monitoring needed";
        return getAlertReason();
    }

    public boolean isAnomalous() {
        return isUnusualAccess() || (isHighRisk() && isFromExternalIP());
    }

    public String getAnomalyScore() {
        if (!isAnomalous()) return "Normal";
        if (isHighRisk() && isUnusualAccess()) return "High anomaly";
        return "Low anomaly";
    }

    public boolean shouldTriggerAlert() {
        return isAnomalous() || requiresEscalation();
    }

    public String getAlertSeverity() {
        if (requiresEscalation()) return "Critical";
        if (isAnomalous()) return "Warning";
        return "Info";
    }

    public String getFullAuditSummary() {
        return String.format("[%s] %s %s on %s by %s from %s (%s) - Risk: %.1f - %s", 
                timestamp, action, eventType, entityType, userId, ipAddress, 
                getLocationType(), riskScore, getComplianceSummary());
    }
}
