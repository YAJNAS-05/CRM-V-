package com.everx.fieldwork.entity;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "field_job_notes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class FieldJobNote extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String fieldJobId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "field_job_id", insertable = false, updatable = false)
    private FieldJob fieldJob;

    @Column(nullable = false)
    private String noteText;

    @Column(nullable = false)
    private String createdBy;

    @Column
    private String createdByName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NoteType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NoteVisibility visibility;

    @Column(nullable = false)
    private Boolean isCustomerVisible = false;

    @Column(nullable = false)
    private Boolean isTechnicianVisible = true;

    @Column(nullable = false)
    private Boolean isManagerVisible = true;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // Attachments and media
    @Column(columnDefinition = "TEXT")
    private String attachmentUrls; // JSON array of URLs

    @Column(columnDefinition = "TEXT")
    private String photoUrls; // JSON array of URLs

    @Column(columnDefinition = "TEXT")
    private String videoUrls; // JSON array of URLs

    @Column(columnDefinition = "TEXT")
    private String documentUrls; // JSON array of URLs

    // Communication tracking
    @Column(nullable = false)
    private Boolean notificationSent = false;

    @Column
    private LocalDateTime notificationSentAt;

    @Column
    private String notificationMethod; // SMS, EMAIL, PUSH

    @Column
    private String notificationRecipients; // JSON array of recipients

    // Location context
    @Column(precision = 10, scale = 6)
    private Double latitude;

    @Column(precision = 10, scale = 6)
    private Double longitude;

    @Column
    private String address;

    // Priority and follow-up
    @Enumerated(EnumType.STRING)
    private NotePriority priority;

    @Column
    private LocalDateTime followUpDate;

    @Column
    private String assignedTo;

    @Column
    private Boolean followUpRequired = false;

    @Column
    private Boolean followUpCompleted = false;

    @Column
    private LocalDateTime followUpCompletedAt;

    @Column
    private String followUpCompletedBy;

    // Job status changes
    @Column
    private String previousStatus;

    @Column
    private String newStatus;

    @Column
    private Boolean isStatusChangeNote = false;

    // Cost and time implications
    @Column
    private String costImplications;

    @Column
    private String timeImplications;

    @Column
    private Boolean requiresCustomerApproval = false;

    @Column
    private Boolean customerApprovalReceived = false;

    @Column
    private LocalDateTime customerApprovalDate;

    @Column
    private String customerApprovalBy;

    // Safety and compliance
    @Column
    private Boolean isSafetyNote = false;

    @Column
    private Boolean requiresSafetyReview = false;

    @Column
    private LocalDateTime safetyReviewDate;

    @Column
    private String safetyReviewBy;

    @Column
    private Boolean safetyReviewCompleted = false;

    // Quality control
    @Column
    private Boolean isQualityNote = false;

    @Column
    private Boolean requiresQualityCheck = false;

    @Column
    private LocalDateTime qualityCheckDate;

    @Column
    private String qualityCheckBy;

    @Column
    private Boolean qualityCheckPassed = false;

    // Integration references
    @Column
    private String erpReference;

    @Column
    private String crmReference;

    @Column
    private String externalReference;

    // Tags and categorization
    @Column(columnDefinition = "TEXT")
    private String tags; // JSON array of tags

    @Column
    private String category;

    @Column
    private String subcategory;

    // Version control
    @Column
    private Integer version = 1;

    @Column
    private String parentNoteId;

    @Column
    private Boolean isEdited = false;

    @Column
    private LocalDateTime lastEditedAt;

    @Column
    private String lastEditedBy;

    // Response tracking
    @Column
    private Boolean requiresResponse = false;

    @Column
    private LocalDateTime responseRequiredBy;

    @Column
    private Boolean responseReceived = false;

    @Column
    private LocalDateTime responseReceivedAt;

    @Column
    private String responseBy;

    @Column(columnDefinition = "TEXT")
    private String responseText;

    // Escalation
    @Column
    private Boolean isEscalated = false;

    @Column
    private LocalDateTime escalatedAt;

    @Column
    private String escalatedTo;

    @Column
    private String escalationReason;

    // Audit trail
    @Column(columnDefinition = "TEXT")
    private String auditTrail; // JSON array of changes

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum NoteType {
        GENERAL,
        STATUS_UPDATE,
        CUSTOMER_COMMUNICATION,
        TECHNICAL_NOTE,
        SAFETY_NOTE,
        QUALITY_NOTE,
        COST_NOTE,
        TIME_NOTE,
        MATERIAL_NOTE,
        EQUIPMENT_NOTE,
        PROBLEM_REPORT,
        SOLUTION_NOTE,
        FOLLOW_UP,
        APPROVAL_REQUEST,
        APPROVAL_RECEIVED,
        REJECTION,
        ESCALATION,
        PHOTO_NOTE,
        VIDEO_NOTE,
        DOCUMENT_NOTE,
        CHECKLIST_ITEM,
        INSPECTION_NOTE,
        COMPLAINT,
        COMPLIMENT,
        SUGGESTION,
        CHANGE_REQUEST,
        DELAY_NOTE,
        CANCELLATION_NOTE,
        COMPLETION_NOTE,
        HANDOVER_NOTE
    }

    public enum NoteVisibility {
        PRIVATE,      // Only creator and managers
        INTERNAL,     // All internal staff
        TECHNICIAN,   // Technician and managers
        CUSTOMER,     // Customer and internal staff
        PUBLIC,       // Everyone
        MANAGER_ONLY, // Only managers
        ADMIN_ONLY    // Only administrators
    }

    public enum NotePriority {
        LOW,
        NORMAL,
        HIGH,
        URGENT,
        CRITICAL
    }
}
