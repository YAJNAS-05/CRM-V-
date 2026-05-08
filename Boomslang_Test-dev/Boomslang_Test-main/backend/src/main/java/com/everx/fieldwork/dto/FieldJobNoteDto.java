package com.everx.fieldwork.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FieldJobNoteDto {
    private UUID id;
    private String fieldJobId;
    private String noteText;
    private String createdBy;
    private String createdByName;
    private String type;
    private String visibility;
    private Boolean isCustomerVisible;
    private Boolean isTechnicianVisible;
    private Boolean isManagerVisible;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String attachmentUrls;
    private String photoUrls;
    private String videoUrls;
    private String documentUrls;
    private Boolean notificationSent;
    private LocalDateTime notificationSentAt;
    private String notificationMethod;
    private String notificationRecipients;
    private Double latitude;
    private Double longitude;
    private String address;
    private String priority;
    private LocalDateTime followUpDate;
    private String assignedTo;
    private Boolean followUpRequired;
    private Boolean followUpCompleted;
    private LocalDateTime followUpCompletedAt;
    private String followUpCompletedBy;
    private String previousStatus;
    private String newStatus;
    private Boolean isStatusChangeNote;
    private String costImplications;
    private String timeImplications;
    private Boolean requiresCustomerApproval;
    private Boolean customerApprovalReceived;
    private LocalDateTime customerApprovalDate;
    private String customerApprovalBy;
    private Boolean isSafetyNote;
    private Boolean requiresSafetyReview;
    private LocalDateTime safetyReviewDate;
    private String safetyReviewBy;
    private Boolean safetyReviewCompleted;
    private Boolean isQualityNote;
    private Boolean requiresQualityCheck;
    private LocalDateTime qualityCheckDate;
    private String qualityCheckBy;
    private Boolean qualityCheckPassed;
    private String erpReference;
    private String crmReference;
    private String externalReference;
    private String tags;
    private String category;
    private String subcategory;
    private Integer version;
    private String parentNoteId;
    private Boolean isEdited;
    private LocalDateTime lastEditedAt;
    private String lastEditedBy;
    private Boolean requiresResponse;
    private LocalDateTime responseRequiredBy;
    private Boolean responseReceived;
    private LocalDateTime responseReceivedAt;
    private String responseBy;
    private String responseText;
    private Boolean isEscalated;
    private LocalDateTime escalatedAt;
    private String escalatedTo;
    private String escalationReason;
    private String auditTrail;

    public enum NoteType {
        GENERAL, STATUS_UPDATE, CUSTOMER_COMMUNICATION, TECHNICAL_NOTE, 
        SAFETY_NOTE, QUALITY_NOTE, COST_NOTE, TIME_NOTE, MATERIAL_NOTE, 
        EQUIPMENT_NOTE, PROBLEM_REPORT, SOLUTION_NOTE, FOLLOW_UP, 
        APPROVAL_REQUEST, APPROVAL_RECEIVED, REJECTION, ESCALATION, 
        PHOTO_NOTE, VIDEO_NOTE, DOCUMENT_NOTE, CHECKLIST_ITEM, 
        INSPECTION_NOTE, COMPLAINT, COMPLIMENT, SUGGESTION, 
        CHANGE_REQUEST, DELAY_NOTE, CANCELLATION_NOTE, COMPLETION_NOTE, HANDOVER_NOTE
    }

    public enum NoteVisibility {
        PRIVATE, INTERNAL, TECHNICIAN, CUSTOMER, PUBLIC, MANAGER_ONLY, ADMIN_ONLY
    }

    public enum NotePriority {
        LOW, NORMAL, HIGH, URGENT, CRITICAL
    }
}
