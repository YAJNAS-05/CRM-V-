package com.everx.collaboration.entity;

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
import java.util.Map;

@Entity
@Table(name = "collaboration_sessions", schema = "everx_collaboration")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class CollaborationSession extends BaseEntity {

    @Column(name = "tenant_id", nullable = false)
    private java.util.UUID tenantId;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "type", nullable = false, length = 50)
    private String type;

    @Column(name = "entity_type", length = 100)
    private String entityType;

    @Column(name = "entity_id")
    private java.util.UUID entityId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private Status status = Status.ACTIVE;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    @Column(name = "archived_at")
    private LocalDateTime archivedAt;

    @Column(name = "last_activity")
    private LocalDateTime lastActivity;

    @Column(name = "settings", columnDefinition = "JSON")
    private Map<String, Object> settings;

    @Column(name = "permissions", columnDefinition = "JSON")
    private Map<String, Object> permissions;

    @Column(name = "max_participants")
    private Integer maxParticipants;

    @Column(name = "is_public", nullable = false)
    @Builder.Default
    private Boolean isPublic = false;

    @Column(name = "is_recording", nullable = false)
    @Builder.Default
    private Boolean isRecording = false;

    @Column(name = "recording_path", length = 500)
    private String recordingPath;

    @Column(name = "tags", columnDefinition = "JSON")
    private List<String> tags;

    @Column(name = "category", length = 100)
    private String category;

    @Column(name = "priority", nullable = false)
    @Builder.Default
    private Integer priority = 0;

    @Column(name = "duration_minutes")
    private Long durationMinutes;

    @Column(name = "participant_count", nullable = false)
    @Builder.Default
    private Integer participantCount = 0;

    @Column(name = "message_count", nullable = false)
    @Builder.Default
    private Long messageCount = 0L;

    @Column(name = "document_count", nullable = false)
    @Builder.Default
    private Integer documentCount = 0;

    @Column(name = "operation_count", nullable = false)
    @Builder.Default
    private Long operationCount = 0L;

    @Column(name = "average_response_time_ms")
    private Double averageResponseTimeMs;

    @Column(name = "peak_participants")
    private Integer peakParticipants;

    @Column(name = "peak_activity_time")
    private LocalDateTime peakActivityTime;

    @Column(name = "quality_score")
    private Double qualityScore;

    @Column(name = "engagement_score")
    private Double engagementScore;

    // Session types
    public static final String TYPE_DOCUMENT_EDITING = "DOCUMENT_EDITING";
    public static final String TYPE_WHITEBOARD = "WHITEBOARD";
    public static final String TYPE_VIDEO_CONFERENCE = "VIDEO_CONFERENCE";
    public static final String TYPE_CHAT = "CHAT";
    public static final String TYPE_CODE_REVIEW = "CODE_REVIEW";
    public static final String TYPE_DESIGN_REVIEW = "DESIGN_REVIEW";
    public static final String TYPE_BRAINSTORMING = "BRAINSTORMING";
    public static final String TYPE_PRESENTATION = "PRESENTATION";
    public static final String TYPE_CUSTOM = "CUSTOM";

    // Status enum
    public enum Status {
        SCHEDULED,
        ACTIVE,
        PAUSED,
        ENDED,
        ARCHIVED,
        CANCELLED
    }

    // Helper methods
    public boolean isActive() {
        return status == Status.ACTIVE;
    }

    public boolean isScheduled() {
        return status == Status.SCHEDULED;
    }

    public boolean isEnded() {
        return status == Status.ENDED;
    }

    public boolean isArchived() {
        return status == Status.ARCHIVED;
    }

    public boolean isCancelled() {
        return status == Status.CANCELLED;
    }

    public boolean isPublic() {
        return isPublic;
    }

    public boolean isRecording() {
        return isRecording;
    }

    public boolean isFull() {
        return maxParticipants != null && participantCount >= maxParticipants;
    }

    public boolean canJoin() {
        return isActive() && !isFull();
    }

    public void startSession() {
        this.status = Status.ACTIVE;
        this.startedAt = LocalDateTime.now();
        this.lastActivity = LocalDateTime.now();
    }

    public void endSession() {
        this.status = Status.ENDED;
        this.endedAt = LocalDateTime.now();
        if (startedAt != null) {
            this.durationMinutes = java.time.Duration.between(startedAt, endedAt).toMinutes();
        }
    }

    public void pauseSession() {
        this.status = Status.PAUSED;
    }

    public void resumeSession() {
        this.status = Status.ACTIVE;
        this.lastActivity = LocalDateTime.now();
    }

    public void archiveSession() {
        this.status = Status.ARCHIVED;
        this.archivedAt = LocalDateTime.now();
    }

    public void cancelSession() {
        this.status = Status.CANCELLED;
        this.endedAt = LocalDateTime.now();
    }

    public void updateLastActivity() {
        this.lastActivity = LocalDateTime.now();
    }

    public void incrementParticipantCount() {
        this.participantCount++;
        if (peakParticipants == null || participantCount > peakParticipants) {
            this.peakParticipants = participantCount;
        }
        updateLastActivity();
    }

    public void decrementParticipantCount() {
        if (participantCount > 0) {
            this.participantCount--;
        }
        updateLastActivity();
    }

    public void incrementMessageCount() {
        this.messageCount++;
        updateLastActivity();
    }

    public void incrementDocumentCount() {
        this.documentCount++;
        updateLastActivity();
    }

    public void incrementOperationCount() {
        this.operationCount++;
        updateLastActivity();
    }

    public void startRecording() {
        this.isRecording = true;
    }

    public void stopRecording() {
        this.isRecording = false;
    }

    public void setRecordingPath(String path) {
        this.recordingPath = path;
    }

    public String getSessionInfo() {
        return String.format("%s (%s) - %s - Participants: %d", 
                name, type, status, participantCount);
    }

    public boolean isDocumentEditing() {
        return TYPE_DOCUMENT_EDITING.equals(type);
    }

    public boolean isWhiteboard() {
        return TYPE_WHITEBOARD.equals(type);
    }

    public boolean isVideoConference() {
        return TYPE_VIDEO_CONFERENCE.equals(type);
    }

    public boolean isChat() {
        return TYPE_CHAT.equals(type);
    }

    public boolean isCodeReview() {
        return TYPE_CODE_REVIEW.equals(type);
    }

    public boolean isDesignReview() {
        return TYPE_DESIGN_REVIEW.equals(type);
    }

    public boolean isBrainstorming() {
        return TYPE_BRAINSTORMING.equals(type);
    }

    public boolean isPresentation() {
        return TYPE_PRESENTATION.equals(type);
    }

    public boolean hasEntity() {
        return entityType != null && entityId != null;
    }

    public boolean hasTags() {
        return tags != null && !tags.isEmpty();
    }

    public boolean hasSettings() {
        return settings != null && !settings.isEmpty();
    }

    public boolean hasPermissions() {
        return permissions != null && !permissions.isEmpty();
    }

    public boolean hasRecording() {
        return recordingPath != null && !recordingPath.isEmpty();
    }

    public boolean isHighPriority() {
        return priority >= 8;
    }

    public boolean isLongSession() {
        return durationMinutes != null && durationMinutes > 120; // > 2 hours
    }

    public boolean isShortSession() {
        return durationMinutes != null && durationMinutes < 30; // < 30 minutes
    }

    public String getDuration() {
        if (durationMinutes == null) return "Unknown";
        if (durationMinutes < 60) return durationMinutes + "m";
        long hours = durationMinutes / 60;
        long minutes = durationMinutes % 60;
        return hours + "h " + minutes + "m";
    }

    public String getEngagementLevel() {
        if (engagementScore == null) return "Unknown";
        if (engagementScore >= 0.8) return "High";
        if (engagementScore >= 0.6) return "Medium";
        if (engagementScore >= 0.4) return "Low";
        return "Very Low";
    }

    public String getQualityLevel() {
        if (qualityScore == null) return "Unknown";
        if (qualityScore >= 0.9) return "Excellent";
        if (qualityScore >= 0.8) return "Good";
        if (qualityScore >= 0.7) return "Fair";
        if (qualityScore >= 0.6) return "Poor";
        return "Very Poor";
    }

    public double getParticipantUtilization() {
        if (maxParticipants == null || maxParticipants == 0) return 0.0;
        return (double) participantCount / maxParticipants;
    }

    public boolean isWellUtilized() {
        return getParticipantUtilization() >= 0.7;
    }

    public boolean isUnderUtilized() {
        return getParticipantUtilization() <= 0.3;
    }

    public double getMessageRate() {
        if (durationMinutes == null || durationMinutes == 0) return 0.0;
        return (double) messageCount / durationMinutes;
    }

    public boolean isHighActivity() {
        return getMessageRate() > 2.0; // > 2 messages per minute
    }

    public boolean isLowActivity() {
        return getMessageRate() < 0.1; // < 1 message per 10 minutes
    }

    public String getSessionSummary() {
        return String.format("[%s] %s - %s - Duration: %s - Participants: %d - Messages: %d", 
                status, name, type, getDuration(), participantCount, messageCount);
    }

    public boolean isRecent() {
        return createdAt != null && createdAt.isAfter(LocalDateTime.now().minusDays(7));
    }

    public boolean isOld() {
        return createdAt != null && createdAt.isBefore(LocalDateTime.now().minusDays(30));
    }

    public boolean shouldHighlight() {
        return isHighPriority() || isHighActivity() || isWellUtilized();
    }

    public String getBusinessValue() {
        if (isCodeReview() || isDesignReview()) return "Quality";
        if (isBrainstorming() || isWhiteboard()) return "Innovation";
        if (isDocumentEditing()) return "Productivity";
        if (isVideoConference() || isPresentation()) return "Communication";
        return "Collaboration";
    }

    public boolean hasGoodEngagement() {
        return engagementScore != null && engagementScore >= 0.7;
    }

    public boolean hasGoodQuality() {
        return qualityScore != null && qualityScore >= 0.8;
    }

    public String getPerformanceMetrics() {
        return String.format("Engagement: %.1f%%, Quality: %.1f%%, Message Rate: %.1f/min", 
                (engagementScore != null ? engagementScore * 100 : 0),
                (qualityScore != null ? qualityScore * 100 : 0),
                getMessageRate());
    }

    public boolean isSuccessful() {
        return hasGoodEngagement() && hasGoodQuality() && !isLowActivity();
    }

    public String getSuccessFactors() {
        List<String> factors = new ArrayList<>();
        if (hasGoodEngagement()) factors.add("High engagement");
        if (hasGoodQuality()) factors.add("Good quality");
        if (isHighActivity()) factors.add("High activity");
        if (isWellUtilized()) factors.add("Good utilization");
        return String.join(", ", factors);
    }

    public String getImprovementAreas() {
        List<String> areas = new ArrayList<>();
        if (!hasGoodEngagement()) areas.add("Low engagement");
        if (!hasGoodQuality()) areas.add("Poor quality");
        if (isLowActivity()) areas.add("Low activity");
        if (isUnderUtilized()) areas.add("Underutilized");
        return String.join(", ", areas);
    }
}
