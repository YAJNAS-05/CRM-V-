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
@Table(name = "field_technicians")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Technician extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String employeeId; // Link to HR employee

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private String mobilePhone;

    @Column
    private String profileImageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TechnicianStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TechnicianLevel level;

    @Column(columnDefinition = "TEXT")
    private String skills;

    @Column(columnDefinition = "TEXT")
    private String certifications;

    @Column(columnDefinition = "TEXT")
    private String specializations;

    @Column(nullable = false)
    private Boolean availableForFieldWork = true;

    @Column(nullable = false)
    private Boolean hasValidDriversLicense = false;

    @Column(nullable = false)
    private Boolean hasVehicle = false;

    @Column
    private String vehicleInfo;

    @Column
    private String licenseNumber;

    @Column
    private LocalDateTime licenseExpiryDate;

    // Current location for GPS tracking
    @Column(precision = 10, scale = 6)
    private Double currentLatitude;

    @Column(precision = 10, scale = 6)
    private Double currentLongitude;

    @Column
    private String currentAddress;

    @Column
    private LocalDateTime lastLocationUpdate;

    // Home base location
    @Column(nullable = false)
    private String homeAddress;

    @Column(precision = 10, scale = 6)
    private Double homeLatitude;

    @Column(precision = 10, scale = 6)
    private Double homeLongitude;

    // Working area/region
    @Column
    private String workingRegion;

    @Column(precision = 10, scale = 6)
    private Double workingAreaRadius; // in kilometers

    // Availability
    @Column(nullable = false)
    private LocalDateTime workStartTime; // Daily start time

    @Column(nullable = false)
    private LocalDateTime workEndTime; // Daily end time

    @Column(nullable = false)
    private Boolean availableWeekends = false;

    @Column(nullable = false)
    private Boolean availableHolidays = false;

    @Column(columnDefinition = "TEXT")
    private String unavailableDates; // JSON array of dates

    // Performance metrics
    @Column(nullable = false)
    private Integer jobsCompleted = 0;

    @Column(nullable = false)
    private Integer jobsInProgress = 0;

    @Column(nullable = false)
    private BigDecimal averageRating = BigDecimal.ZERO;

    @Column(nullable = false)
    private Integer totalRatings = 0;

    @Column(nullable = false)
    private BigDecimal totalEarnings = BigDecimal.ZERO;

    @Column(nullable = false)
    private BigDecimal averageJobDuration = BigDecimal.ZERO; // in minutes

    @Column(nullable = false)
    private Integer onTimeCompletionRate = 100; // percentage

    @Column(nullable = false)
    private Integer customerSatisfactionScore = 100; // percentage

    // Skills and qualifications
    @Column(columnDefinition = "TEXT")
    private String technicalSkills;

    @Column(columnDefinition = "TEXT")
    private String softSkills;

    @Column(columnDefinition = "TEXT")
    private String safetyTraining;

    @Column(columnDefinition = "TEXT")
    private String equipmentTraining;

    // Equipment assigned
    @Column(columnDefinition = "TEXT")
    private String assignedEquipment;

    @Column(columnDefinition = "TEXT")
    private String assignedTools;

    @Column(columnDefinition = "TEXT")
    private String assignedVehicle;

    // Communication preferences
    @Column(nullable = false)
    private Boolean smsNotificationsEnabled = true;

    @Column(nullable = false)
    private Boolean emailNotificationsEnabled = true;

    @Column(nullable = false)
    private Boolean pushNotificationsEnabled = true;

    @Column
    private String preferredLanguage = "en";

    // Emergency contact
    @Column
    private String emergencyContactName;

    @Column
    private String emergencyContactPhone;

    @Column
    private String emergencyContactRelationship;

    // Health and safety
    @Column(nullable = false)
    private Boolean medicalClearanceValid = true;

    @Column
    private LocalDateTime medicalClearanceExpiry;

    @Column(columnDefinition = "TEXT")
    private String medicalConditions;

    @Column(columnDefinition = "TEXT")
    private String allergies;

    // Training records
    @Column
    private LocalDateTime lastSafetyTraining;

    @Column
    private LocalDateTime lastTechnicalTraining;

    @Column(columnDefinition = "TEXT")
    private String trainingRecords;

    // GPS tracking settings
    @Column(nullable = false)
    private Boolean gpsTrackingEnabled = true;

    @Column(nullable = false)
    private Boolean locationSharingEnabled = true;

    @Column(nullable = false)
    private Integer locationUpdateInterval = 5; // in minutes

    // Integration fields
    @Column
    private String hrEmployeeId;

    @Column
    private String payrollId;

    @Column
    private String badgeNumber;

    // Audit fields
    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Column(nullable = false)
    private String createdBy;

    @Column(nullable = false)
    private String lastModifiedBy;

    @OneToMany(mappedBy = "assignedTechnician", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<FieldJob> assignedJobs;

    @OneToMany(mappedBy = "technician", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<GpsLocation> gpsLocations;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum TechnicianStatus {
        ACTIVE,
        INACTIVE,
        ON_LEAVE,
        SUSPENDED,
        TRAINING,
        UNAVAILABLE
    }

    public enum TechnicianLevel {
        APPRENTICE (1, "Apprentice"),
        JUNIOR (2, "Junior Technician"),
        INTERMEDIATE (3, "Intermediate Technician"),
        SENIOR (4, "Senior Technician"),
        MASTER (5, "Master Technician");

        private final int level;
        private final String displayName;

        TechnicianLevel(int level, String displayName) {
            this.level = level;
            this.displayName = displayName;
        }

        public int getLevel() {
            return level;
        }

        public String getDisplayName() {
            return displayName;
        }
    }
}
