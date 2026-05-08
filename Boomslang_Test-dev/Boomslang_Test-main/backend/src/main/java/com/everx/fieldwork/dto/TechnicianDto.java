package com.everx.fieldwork.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TechnicianDto {
    private UUID id;
    private String employeeId;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String mobilePhone;
    private String profileImageUrl;
    private String status;
    private String level;
    private String skills;
    private String certifications;
    private String specializations;
    private Boolean availableForFieldWork;
    private Boolean hasValidDriversLicense;
    private Boolean hasVehicle;
    private String vehicleInfo;
    private String licenseNumber;
    private LocalDateTime licenseExpiryDate;
    private Double currentLatitude;
    private Double currentLongitude;
    private String currentAddress;
    private LocalDateTime lastLocationUpdate;
    private String homeAddress;
    private Double homeLatitude;
    private Double homeLongitude;
    private String workingRegion;
    private Double workingAreaRadius;
    private LocalDateTime workStartTime;
    private LocalDateTime workEndTime;
    private Boolean availableWeekends;
    private Boolean availableHolidays;
    private String unavailableDates;
    private Integer jobsCompleted;
    private Integer jobsInProgress;
    private BigDecimal averageRating;
    private Integer totalRatings;
    private BigDecimal totalEarnings;
    private BigDecimal averageJobDuration;
    private Integer onTimeCompletionRate;
    private Integer customerSatisfactionScore;
    private String technicalSkills;
    private String softSkills;
    private String safetyTraining;
    private String equipmentTraining;
    private String assignedEquipment;
    private String assignedTools;
    private String assignedVehicle;
    private Boolean smsNotificationsEnabled;
    private Boolean emailNotificationsEnabled;
    private Boolean pushNotificationsEnabled;
    private String preferredLanguage;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String emergencyContactRelationship;
    private Boolean medicalClearanceValid;
    private LocalDateTime medicalClearanceExpiry;
    private String medicalConditions;
    private String allergies;
    private LocalDateTime lastSafetyTraining;
    private LocalDateTime lastTechnicalTraining;
    private String trainingRecords;
    private Boolean gpsTrackingEnabled;
    private Boolean locationSharingEnabled;
    private Integer locationUpdateInterval;
    private String hrEmployeeId;
    private String payrollId;
    private String badgeNumber;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String lastModifiedBy;

    public enum TechnicianStatus {
        ACTIVE, INACTIVE, ON_LEAVE, SUSPENDED, TRAINING, UNAVAILABLE
    }

    public enum TechnicianLevel {
        APPRENTICE(1, "Apprentice"),
        JUNIOR(2, "Junior Technician"),
        INTERMEDIATE(3, "Intermediate Technician"),
        SENIOR(4, "Senior Technician"),
        MASTER(5, "Master Technician");

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
