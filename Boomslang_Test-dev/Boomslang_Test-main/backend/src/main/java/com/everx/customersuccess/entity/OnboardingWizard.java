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
@Table(name = "onboarding_wizards")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OnboardingWizard {

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "customer_id", nullable = false)
    private UUID customerId;

    @Column(name = "wizard_name", nullable = false)
    private String wizardName;

    @Column(name = "description")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "wizard_type", nullable = false)
    private WizardType wizardType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status;

    @Enumerated(EnumType.STRING)
    @Column(name = "industry")
    private Industry industry;

    @Column(name = "company_size")
    private String companySize;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "steps")
    private List<WizardStep> steps;

    @Column(name = "current_step_index")
    private Integer currentStepIndex;

    @Column(name = "total_steps")
    private Integer totalSteps;

    @Column(name = "completed_steps")
    private Integer completedSteps;

    @Column(name = "completion_percentage")
    private Double completionPercentage;

    @Column(name = "estimated_duration_minutes")
    private Integer estimatedDurationMinutes;

    @Column(name = "actual_duration_minutes")
    private Integer actualDurationMinutes;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "last_activity_at")
    private LocalDateTime lastActivityAt;

    @Column(name = "next_step_due_date")
    private LocalDateTime nextStepDueDate;

    @Column(name = "assigned_to")
    private String assignedTo;

    @Column(name = "created_by", nullable = false)
    private String createdBy;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "updated_by")
    private String updatedBy;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "configuration")
    private Map<String, Object> configuration;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "template_data")
    private Map<String, Object> templateData;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "progress_data")
    private Map<String, Object> progressData;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "checklist_items")
    private List<ChecklistItem> checklistItems;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "resources")
    private List<Resource> resources;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "notes")
    private List<Note> notes;

    @Column(name = "is_skippable")
    private Boolean isSkippable;

    @Column(name = "is_required")
    private Boolean isRequired;

    @Column(name = "auto_progress")
    private Boolean autoProgress;

    @Column(name = "send_reminders")
    private Boolean sendReminders;

    @Column(name = "reminder_frequency_hours")
    private Integer reminderFrequencyHours;

    @Column(name = "last_reminder_sent")
    private LocalDateTime lastReminderSent;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata")
    private Map<String, Object> metadata;

    // Helper methods
    public boolean isActive() {
        return Status.ACTIVE.equals(status);
    }

    public boolean isCompleted() {
        return Status.COMPLETED.equals(status);
    }

    public boolean isPaused() {
        return Status.PAUSED.equals(status);
    }

    public boolean isOverdue() {
        return nextStepDueDate != null && 
               LocalDateTime.now().isAfter(nextStepDueDate) && 
               !isCompleted();
    }

    public WizardStep getCurrentStep() {
        if (steps == null || currentStepIndex == null || 
            currentStepIndex < 0 || currentStepIndex >= steps.size()) {
            return null;
        }
        return steps.get(currentStepIndex);
    }

    public boolean hasNextStep() {
        return steps != null && currentStepIndex != null && 
               currentStepIndex < steps.size() - 1;
    }

    public WizardStep getNextStep() {
        if (!hasNextStep()) return null;
        return steps.get(currentStepIndex + 1);
    }

    public void moveToNextStep() {
        if (hasNextStep()) {
            this.currentStepIndex++;
            this.lastActivityAt = LocalDateTime.now();
            calculateProgress();
            scheduleNextStepDueDate();
        }
    }

    public void completeCurrentStep() {
        WizardStep currentStep = getCurrentStep();
        if (currentStep != null) {
            currentStep.setStatus(StepStatus.COMPLETED);
            currentStep.setCompletedAt(LocalDateTime.now());
            moveToNextStep();
        }
    }

    public void calculateProgress() {
        if (steps == null || steps.isEmpty()) {
            this.completionPercentage = 0.0;
            return;
        }

        long completedStepsCount = steps.stream()
                .mapToLong(step -> StepStatus.COMPLETED.equals(step.getStatus()) ? 1 : 0)
                .sum();

        this.completedSteps = (int) completedStepsCount;
        this.completionPercentage = (double) completedStepsCount / steps.size() * 100;

        if (this.completionPercentage >= 100.0) {
            completeWizard();
        }
    }

    public void completeWizard() {
        this.status = Status.COMPLETED;
        this.completedAt = LocalDateTime.now();
        this.completionPercentage = 100.0;
        this.completedSteps = this.totalSteps;
    }

    public void pauseWizard(String reason) {
        this.status = Status.PAUSED;
        this.lastActivityAt = LocalDateTime.now();
        addNote(Note.builder()
                .content("Wizard paused: " + reason)
                .author("System")
                .timestamp(LocalDateTime.now())
                .type(NoteType.SYSTEM)
                .isInternal(true)
                .build());
    }

    public void resumeWizard() {
        this.status = Status.ACTIVE;
        this.lastActivityAt = LocalDateTime.now();
        scheduleNextStepDueDate();
    }

    public void scheduleNextStepDueDate() {
        WizardStep nextStep = getNextStep();
        if (nextStep != null && nextStep.getEstimatedDurationMinutes() != null) {
            this.nextStepDueDate = LocalDateTime.now().plusMinutes(nextStep.getEstimatedDurationMinutes());
        }
    }

    public boolean needsReminder() {
        return sendReminders != null && sendReminders && 
               reminderFrequencyHours != null &&
               (lastReminderSent == null || 
                lastReminderSent.isBefore(LocalDateTime.now().minusHours(reminderFrequencyHours)));
    }

    public void sendReminder() {
        this.lastReminderSent = LocalDateTime.now();
    }

    public void addChecklistItem(ChecklistItem item) {
        if (this.checklistItems == null) {
            this.checklistItems = new java.util.ArrayList<>();
        }
        this.checklistItems.add(item);
    }

    public void completeChecklistItem(String itemId) {
        if (checklistItems != null) {
            checklistItems.stream()
                    .filter(item -> item.getId().equals(itemId))
                    .findFirst()
                    .ifPresent(item -> {
                        item.setCompleted(true);
                        item.setCompletedAt(LocalDateTime.now());
                    });
        }
    }

    public long getCompletedChecklistItemsCount() {
        if (checklistItems == null) return 0;
        return checklistItems.stream()
                .filter(ChecklistItem::isCompleted)
                .count();
    }

    public long getTotalChecklistItemsCount() {
        return checklistItems == null ? 0 : checklistItems.size();
    }

    public void addResource(Resource resource) {
        if (this.resources == null) {
            this.resources = new java.util.ArrayList<>();
        }
        this.resources.add(resource);
    }

    public void addNote(Note note) {
        if (this.notes == null) {
            this.notes = new java.util.ArrayList<>();
        }
        this.notes.add(note);
    }

    public void calculateActualDuration() {
        if (startedAt != null && completedAt != null) {
            this.actualDurationMinutes = (int) java.time.Duration.between(startedAt, completedAt).toMinutes();
        }
    }

    public enum WizardType {
        INITIAL_SETUP,
        FEATURE_ONBOARDING,
        INTEGRATION_SETUP,
        TEAM_ONBOARDING,
        MIGRATION,
        CUSTOMER_SUCCESS,
        INDUSTRY_SPECIFIC,
        CUSTOM
    }

    public enum Status {
        NOT_STARTED,
        ACTIVE,
        PAUSED,
        COMPLETED,
        CANCELLED,
        SKIPPED
    }

    public enum Industry {
        TECHNOLOGY,
        HEALTHCARE,
        FINANCIAL_SERVICES,
        RETAIL,
        MANUFACTURING,
        EDUCATION,
        GOVERNMENT,
        NON_PROFIT,
        PROFESSIONAL_SERVICES,
        CONSTRUCTION,
        HOSPITALITY,
        TRANSPORTATION,
        OTHER
    }

    @lombok.Data
    @lombok.Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WizardStep {
        private String id;
        private String title;
        private String description;
        private StepType type;
        private StepStatus status;
        private Integer order;
        private Integer estimatedDurationMinutes;
        private Boolean isRequired;
        private Boolean isSkippable;
        private LocalDateTime startedAt;
        private LocalDateTime completedAt;
        private String assignedTo;
        private List<String> dependencies;
        private Map<String, Object> configuration;
        private List<String> prerequisites;
        private String helpText;
        private List<Resource> resources;
    }

    @lombok.Data
    @lombok.Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChecklistItem {
        private String id;
        private String title;
        private String description;
        private Boolean completed;
        private LocalDateTime completedAt;
        private String completedBy;
        private Integer order;
        private String category;
        private List<String> dependencies;
    }

    @lombok.Data
    @lombok.Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Resource {
        private String id;
        private String name;
        private String type;
        private String url;
        private String description;
        private String category;
        private LocalDateTime addedAt;
        private String addedBy;
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

    public enum StepType {
        INFORMATION,
        DATA_COLLECTION,
        CONFIGURATION,
        INTEGRATION,
        TRAINING,
        APPROVAL,
        VERIFICATION,
        CUSTOM
    }

    public enum StepStatus {
        NOT_STARTED,
        IN_PROGRESS,
        COMPLETED,
        SKIPPED,
        BLOCKED,
        FAILED
    }

    public enum NoteType {
        GENERAL,
        SYSTEM,
        USER_FEEDBACK,
        ISSUE,
        SUCCESS,
        REMINDER
    }
}
