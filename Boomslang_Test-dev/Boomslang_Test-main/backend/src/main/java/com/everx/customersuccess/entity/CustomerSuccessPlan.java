package com.everx.customersuccess.entity;

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
@Table(name = "customer_success_plans")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerSuccessPlan {

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "customer_id", nullable = false)
    private UUID customerId;

    @Column(name = "plan_name", nullable = false)
    private String planName;

    @Column(name = "description")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "plan_type", nullable = false)
    private PlanType planType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false)
    private Priority priority;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "goals")
    private List<Goal> goals;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "milestones")
    private List<Milestone> milestones;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "success_metrics")
    private List<SuccessMetric> successMetrics;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "action_items")
    private List<ActionItem> actionItems;

    @Column(name = "customer_success_manager_id")
    private UUID customerSuccessManagerId;

    @Column(name = "account_manager_id")
    private UUID accountManagerId;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Column(name = "review_frequency_days")
    private Integer reviewFrequencyDays;

    @Column(name = "next_review_date")
    private LocalDateTime nextReviewDate;

    @Column(name = "last_review_date")
    private LocalDateTime lastReviewDate;

    @Column(name = "health_score")
    private Integer healthScore;

    @Column(name = "adoption_score")
    private Integer adoptionScore;

    @Column(name = "satisfaction_score")
    private Integer satisfactionScore;

    @Column(name = "risk_level")
    private String riskLevel;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "notes")
    private List<Note> notes;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "resources")
    private List<Resource> resources;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "created_by", nullable = false)
    private String createdBy;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "completion_percentage")
    private Double completionPercentage;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata")
    private Map<String, Object> metadata;

    @Column(name = "tags")
    private List<String> tags;

    @Column(name = "industry")
    private String industry;

    @Column(name = "company_size")
    private String companySize;

    @Column(name = "subscription_tier")
    private String subscriptionTier;

    // Helper methods
    public boolean isActive() {
        return Status.ACTIVE.equals(status);
    }

    public boolean isCompleted() {
        return Status.COMPLETED.equals(status);
    }

    public boolean isOnTrack() {
        return healthScore != null && healthScore >= 70;
    }

    public boolean isAtRisk() {
        return "HIGH".equals(riskLevel) || (healthScore != null && healthScore < 50);
    }

    public boolean needsReview() {
        return nextReviewDate != null && LocalDateTime.now().isAfter(nextReviewDate);
    }

    public void updateHealthScore(Integer score) {
        this.healthScore = score;
        this.lastReviewDate = LocalDateTime.now();
        
        // Update risk level based on health score
        if (score >= 80) {
            this.riskLevel = "LOW";
        } else if (score >= 60) {
            this.riskLevel = "MEDIUM";
        } else {
            this.riskLevel = "HIGH";
        }
    }

    public void calculateCompletionPercentage() {
        if (goals == null || goals.isEmpty()) {
            this.completionPercentage = 0.0;
            return;
        }
        
        long completedGoals = goals.stream()
                .mapToLong(goal -> GoalStatus.COMPLETED.equals(goal.getStatus()) ? 1 : 0)
                .sum();
        
        this.completionPercentage = (double) completedGoals / goals.size() * 100;
    }

    public void scheduleNextReview() {
        if (reviewFrequencyDays != null && lastReviewDate != null) {
            this.nextReviewDate = lastReviewDate.plusDays(reviewFrequencyDays);
        }
    }

    public void addNote(Note note) {
        if (this.notes == null) {
            this.notes = new java.util.ArrayList<>();
        }
        this.notes.add(note);
    }

    public void addActionItem(ActionItem actionItem) {
        if (this.actionItems == null) {
            this.actionItems = new java.util.ArrayList<>();
        }
        this.actionItems.add(actionItem);
    }

    public boolean hasOverdueMilestones() {
        if (milestones == null) return false;
        
        LocalDateTime now = LocalDateTime.now();
        return milestones.stream()
                .anyMatch(milestone -> 
                        !MilestoneStatus.COMPLETED.equals(milestone.getStatus()) &&
                        milestone.getTargetDate() != null &&
                        milestone.getTargetDate().isBefore(now));
    }

    public long getCompletedGoalsCount() {
        if (goals == null) return 0;
        return goals.stream()
                .filter(goal -> GoalStatus.COMPLETED.equals(goal.getStatus()))
                .count();
    }

    public long getTotalGoalsCount() {
        return goals == null ? 0 : goals.size();
    }

    public enum PlanType {
        ONBOARDING,
        ADOPTION,
        RETENTION,
        EXPANSION,
        RECOVERY,
        CUSTOM
    }

    public enum Status {
        DRAFT,
        ACTIVE,
        PAUSED,
        COMPLETED,
        CANCELLED
    }

    public enum Priority {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL
    }

    @lombok.Data
    @lombok.Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Goal {
        private String title;
        private String description;
        private GoalStatus status;
        private LocalDateTime targetDate;
        private LocalDateTime completedDate;
        private String owner;
        private Integer progressPercentage;
        private List<String> dependencies;
        private Map<String, Object> metrics;
    }

    @lombok.Data
    @lombok.Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Milestone {
        private String title;
        private String description;
        private MilestoneStatus status;
        private LocalDateTime targetDate;
        private LocalDateTime completedDate;
        private List<String> deliverables;
        private String responsiblePerson;
    }

    @lombok.Data
    @lombok.Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SuccessMetric {
        private String name;
        private String description;
        private String metricType;
        private Double targetValue;
        private Double currentValue;
        private String unit;
        private LocalDateTime measurementDate;
        private Boolean isAchieved;
    }

    @lombok.Data
    @lombok.Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActionItem {
        private String title;
        private String description;
        private ActionItemStatus status;
        private LocalDateTime dueDate;
        private LocalDateTime completedDate;
        private String assignedTo;
        private Integer priority;
        private List<String> dependencies;
    }

    @lombok.Data
    @lombok.Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Note {
        private String content;
        private String author;
        private LocalDateTime timestamp;
        private NoteType type;
        private Boolean isInternal;
    }

    @lombok.Data
    @lombok.Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Resource {
        private String name;
        private String type;
        private String url;
        private String description;
        private LocalDateTime addedDate;
        private String addedBy;
    }

    public enum GoalStatus {
        NOT_STARTED,
        IN_PROGRESS,
        COMPLETED,
        BLOCKED,
        CANCELLED
    }

    public enum MilestoneStatus {
        NOT_STARTED,
        IN_PROGRESS,
        COMPLETED,
        DELAYED,
        CANCELLED
    }

    public enum ActionItemStatus {
        NOT_STARTED,
        IN_PROGRESS,
        COMPLETED,
        OVERDUE,
        CANCELLED
    }

    public enum NoteType {
        GENERAL,
        MEETING,
        DECISION,
        ISSUE,
        SUCCESS,
        CONCERN
    }
}
