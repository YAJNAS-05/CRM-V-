package com.everx.fieldwork.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTechnicianRequest {
    
    @NotBlank(message = "Employee ID is required")
    private String employeeId;

    @NotBlank(message = "First name is required")
    @Size(max = 100, message = "First name must not exceed 100 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 100, message = "Last name must not exceed 100 characters")
    private String lastName;

    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    private String email;

    @Size(max = 20, message = "Phone must not exceed 20 characters")
    private String phone;

    @Size(max = 20, message = "Mobile phone must not exceed 20 characters")
    private String mobilePhone;

    private String profileImageUrl;

    private String status = "ACTIVE";

    private String level;

    @Size(max = 2000, message = "Skills must not exceed 2000 characters")
    private String skills;

    @Size(max = 2000, message = "Certifications must not exceed 2000 characters")
    private String certifications;

    @Size(max = 2000, message = "Specializations must not exceed 2000 characters")
    private String specializations;

    private Boolean availableForFieldWork = true;

    private Boolean hasValidDriversLicense = false;

    private Boolean hasVehicle = false;

    @Size(max = 500, message = "Vehicle info must not exceed 500 characters")
    private String vehicleInfo;

    @Size(max = 50, message = "License number must not exceed 50 characters")
    private String licenseNumber;

    private LocalDateTime licenseExpiryDate;

    private Double homeLatitude;

    private Double homeLongitude;

    @NotBlank(message = "Home address is required")
    @Size(max = 500, message = "Home address must not exceed 500 characters")
    private String homeAddress;

    @Size(max = 100, message = "Working region must not exceed 100 characters")
    private String workingRegion;

    private Double workingAreaRadius;

    private LocalDateTime workStartTime;

    private LocalDateTime workEndTime;

    private Boolean availableWeekends = false;

    private Boolean availableHolidays = false;

    private String technicalSkills;

    private String softSkills;

    private String safetyTraining;

    private String equipmentTraining;

    private String assignedEquipment;

    private String assignedTools;

    private String assignedVehicle;

    private Boolean smsNotificationsEnabled = true;

    private Boolean emailNotificationsEnabled = true;

    private Boolean pushNotificationsEnabled = true;

    private String preferredLanguage = "en";

    private String emergencyContactName;

    private String emergencyContactPhone;

    private String emergencyContactRelationship;

    private Boolean medicalClearanceValid = true;

    private LocalDateTime medicalClearanceExpiry;

    private String medicalConditions;

    private String allergies;

    private LocalDateTime lastSafetyTraining;

    private LocalDateTime lastTechnicalTraining;

    private String trainingRecords;

    private Boolean gpsTrackingEnabled = true;

    private Boolean locationSharingEnabled = true;

    private Integer locationUpdateInterval = 5;

    private String hrEmployeeId;

    private String payrollId;

    private String badgeNumber;

    @NotBlank(message = "Created by is required")
    private String createdBy;
}
