package com.everx.fieldwork.entity;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "field_jobs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class FieldJob extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String jobNumber;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private String customerName;

    @Column(nullable = false)
    private String customerPhone;

    @Column(nullable = false)
    private String customerEmail;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private JobStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private JobPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private JobCategory category;

    @Column(nullable = false)
    private LocalDateTime scheduledDate;

    @Column(nullable = false)
    private LocalDateTime estimatedStartDate;

    @Column(nullable = false)
    private LocalDateTime estimatedEndDate;

    private LocalDateTime actualStartDate;

    private LocalDateTime actualEndDate;

    @Column(nullable = false)
    private Integer estimatedDuration; // in minutes

    private Integer actualDuration; // in minutes

    @Column(precision = 19, scale = 2)
    private BigDecimal estimatedCost;

    @Column(precision = 19, scale = 2)
    private BigDecimal actualCost;

    @Column(nullable = false)
    private String assignedTechnicianId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_technician_id", insertable = false, updatable = false)
    private Technician assignedTechnician;

    @OneToMany(mappedBy = "fieldJob", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<GpsLocation> gpsLocations;

    @OneToMany(mappedBy = "fieldJob", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<FieldWorkAsset> assets;

    @OneToMany(mappedBy = "fieldJob", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<FieldJobNote> notes;

    @Column(nullable = false)
    private String createdBy;

    @Column(nullable = false)
    private String lastModifiedBy;

    @Column
    private String completedBy;

    @Column(columnDefinition = "TEXT")
    private String completionNotes;

    @Column(nullable = false)
    private Boolean requiresParts = false;

    @Column(nullable = false)
    private Boolean requiresSpecialEquipment = false;

    @Column(columnDefinition = "TEXT")
    private String specialRequirements;

    @Column(nullable = false)
    private Boolean customerNotificationSent = false;

    @Column(nullable = false)
    private Boolean technicianNotificationSent = false;

    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;

    @Column(precision = 19, scale = 2)
    private BigDecimal amountPaid;

    @Column
    private LocalDateTime paymentDate;

    @Column(columnDefinition = "TEXT")
    private String paymentReference;

    // GPS coordinates for the job location
    @Column(precision = 10, scale = 6)
    private Double latitude;

    @Column(precision = 10, scale = 6)
    private Double longitude;

    @Column
    private String fullAddress;

    // Job completion details
    @Column
    private String workPerformed;

    @Column(columnDefinition = "TEXT")
    private String technicianNotes;

    @Column
    private Boolean customerSignatureRequired = false;

    @Column(columnDefinition = "TEXT")
    private String customerSignature;

    @Column
    private LocalDateTime customerSignatureDate;

    // Rating and feedback
    @Column
    private Integer customerRating; // 1-5 stars

    @Column(columnDefinition = "TEXT")
    private String customerFeedback;

    @Column
    private LocalDateTime feedbackDate;

    // Rescheduling information
    private LocalDateTime originalScheduledDate;

    @Column(columnDefinition = "TEXT")
    private String rescheduleReason;

    // Cancellation information
    private LocalDateTime cancelledDate;

    @Column(columnDefinition = "TEXT")
    private String cancellationReason;

    @Column
    private String cancelledBy;

    // Job type and complexity
    @Enumerated(EnumType.STRING)
    private JobComplexity complexity;

    @Column
    private Integer requiredTechnicianLevel; // 1-5

    @Column
    private String requiredSkills;

    // Weather dependency
    @Column(nullable = false)
    private Boolean weatherDependent = false;

    @Column
    private String weatherConditions;

    // Safety requirements
    @Column(nullable = false)
    private Boolean safetyEquipmentRequired = false;

    @Column(columnDefinition = "TEXT")
    private String safetyRequirements;

    // Integration fields
    @Column
    private String erpAssetId;

    @Column
    private String erpWorkOrderId;

    @Column
    private String crmLeadId;

    @Column
    private String crmAccountId;

    // Audit fields
    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum JobStatus {
        DRAFT,
        SCHEDULED,
        ASSIGNED,
        IN_PROGRESS,
        PENDING_PARTS,
        PENDING_CUSTOMER_APPROVAL,
        COMPLETED,
        CANCELLED,
        REVERSED,
        PENDING_SIGN_OFF
    }

    public enum JobPriority {
        ROUTINE,
        URGENT,
        CRITICAL,
        EMERGENCY
    }

    public enum JobCategory {
        INSTALLATION,
        MAINTENANCE,
        REPAIR,
        INSPECTION,
        ASSESSMENT,
        AUDIT,
        CONSULTATION,
        TRAINING,
        OTHER
    }

    public enum PaymentStatus {
        PENDING,
        PAID,
        PARTIALLY_PAID,
        OVERDUE,
        CANCELLED
    }

    public enum JobComplexity {
        SIMPLE,
        MODERATE,
        COMPLEX,
        VERY_COMPLEX
    }
}
