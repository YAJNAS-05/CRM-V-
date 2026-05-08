package com.everx.fieldwork.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FieldJobDto {
    private UUID id;
    private String jobNumber;
    private String title;
    private String description;
    private String location;
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private String status;
    private String priority;
    private String category;
    private LocalDateTime scheduledDate;
    private LocalDateTime estimatedStartDate;
    private LocalDateTime estimatedEndDate;
    private LocalDateTime actualStartDate;
    private LocalDateTime actualEndDate;
    private Integer estimatedDuration;
    private Integer actualDuration;
    private BigDecimal estimatedCost;
    private BigDecimal actualCost;
    private String assignedTechnicianId;
    private TechnicianDto assignedTechnician;
    private List<GpsLocationDto> gpsLocations;
    private List<FieldWorkAssetDto> assets;
    private List<FieldJobNoteDto> notes;
    private Boolean requiresParts;
    private Boolean requiresSpecialEquipment;
    private String specialRequirements;
    private Boolean customerNotificationSent;
    private Boolean technicianNotificationSent;
    private String paymentStatus;
    private BigDecimal amountPaid;
    private LocalDateTime paymentDate;
    private String paymentReference;
    private Double latitude;
    private Double longitude;
    private String fullAddress;
    private String workPerformed;
    private String technicianNotes;
    private Boolean customerSignatureRequired;
    private String customerSignature;
    private LocalDateTime customerSignatureDate;
    private Integer customerRating;
    private String customerFeedback;
    private LocalDateTime feedbackDate;
    private LocalDateTime originalScheduledDate;
    private String rescheduleReason;
    private LocalDateTime cancelledDate;
    private String cancellationReason;
    private String cancelledBy;
    private String complexity;
    private Integer requiredTechnicianLevel;
    private String requiredSkills;
    private Boolean weatherDependent;
    private String weatherConditions;
    private Boolean safetyEquipmentRequired;
    private String safetyRequirements;
    private String erpAssetId;
    private String erpWorkOrderId;
    private String crmLeadId;
    private String crmAccountId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String lastModifiedBy;
    private String completedBy;

    // Nested enums for DTO
    public enum JobStatus {
        DRAFT, SCHEDULED, ASSIGNED, IN_PROGRESS, PENDING_PARTS, 
        PENDING_CUSTOMER_APPROVAL, COMPLETED, CANCELLED, REVERSED, PENDING_SIGN_OFF
    }

    public enum JobPriority {
        ROUTINE, URGENT, CRITICAL, EMERGENCY
    }

    public enum JobCategory {
        INSTALLATION, MAINTENANCE, REPAIR, INSPECTION, ASSESSMENT, 
        AUDIT, CONSULTATION, TRAINING, OTHER
    }

    public enum PaymentStatus {
        PENDING, PAID, PARTIALLY_PAID, OVERDUE, CANCELLED
    }

    public enum JobComplexity {
        SIMPLE, MODERATE, COMPLEX, VERY_COMPLEX
    }
}
