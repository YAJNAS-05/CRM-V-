package com.everx.fieldwork.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateFieldJobRequest {
    
    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;

    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    @NotBlank(message = "Location is required")
    @Size(max = 500, message = "Location must not exceed 500 characters")
    private String location;

    @NotBlank(message = "Customer name is required")
    @Size(max = 200, message = "Customer name must not exceed 200 characters")
    private String customerName;

    @Size(max = 50, message = "Customer phone must not exceed 50 characters")
    private String customerPhone;

    @Size(max = 200, message = "Customer email must not exceed 200 characters")
    private String customerEmail;

    @NotNull(message = "Priority is required")
    private String priority;

    @NotNull(message = "Category is required")
    private String category;

    @NotNull(message = "Scheduled date is required")
    @Future(message = "Scheduled date must be in the future")
    private java.time.LocalDateTime scheduledDate;

    private java.time.LocalDateTime estimatedStartDate;

    @NotNull(message = "Estimated end date is required")
    @Future(message = "Estimated end date must be in the future")
    private java.time.LocalDateTime estimatedEndDate;

    @NotNull(message = "Estimated duration is required")
    private Integer estimatedDuration; // in minutes

    private BigDecimal estimatedCost;

    private String assignedTechnicianId;

    private Boolean requiresParts = false;

    private Boolean requiresSpecialEquipment = false;

    @Size(max = 1000, message = "Special requirements must not exceed 1000 characters")
    private String specialRequirements;

    private Double latitude;

    private Double longitude;

    @Size(max = 500, message = "Full address must not exceed 500 characters")
    private String fullAddress;

    private String complexity;

    private Integer requiredTechnicianLevel;

    @Size(max = 1000, message = "Required skills must not exceed 1000 characters")
    private String requiredSkills;

    private Boolean weatherDependent = false;

    private Boolean safetyEquipmentRequired = false;

    @Size(max = 1000, message = "Safety requirements must not exceed 1000 characters")
    private String safetyRequirements;

    private String erpAssetId;

    private String erpWorkOrderId;

    private String crmLeadId;

    private String crmAccountId;

    @NotBlank(message = "Created by is required")
    private String createdBy;
}
