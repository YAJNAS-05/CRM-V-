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
public class FieldWorkAssetDto {
    private UUID id;
    private String fieldJobId;
    private String assetTag;
    private String assetName;
    private String assetDescription;
    private String assetCategory;
    private String assetType;
    private String manufacturer;
    private String model;
    private String serialNumber;
    private String partNumber;
    private String erpItemId;
    private String erpAssetId;
    private String erpLocationId;
    private String erpWarehouseId;
    private String status;
    private String condition;
    private String conditionNotes;
    private LocalDateTime lastInspectionDate;
    private String lastInspectedBy;
    private String inspectionNotes;
    private BigDecimal quantity;
    private String unitOfMeasure;
    private BigDecimal weight;
    private BigDecimal volume;
    private String dimensions;
    private BigDecimal unitCost;
    private BigDecimal totalCost;
    private String currency;
    private LocalDateTime purchaseDate;
    private String supplier;
    private String purchaseOrderNumber;
    private LocalDateTime warrantyExpiryDate;
    private String warrantyProvider;
    private String warrantyTerms;
    private LocalDateTime lastMaintenanceDate;
    private LocalDateTime nextMaintenanceDate;
    private String maintenanceNotes;
    private Integer usageCount;
    private LocalDateTime firstUsedDate;
    private LocalDateTime lastUsedDate;
    private String usedBy;
    private String currentLocation;
    private Double currentLatitude;
    private Double currentLongitude;
    private LocalDateTime locationUpdatedDate;
    private Boolean requiresSafetyTraining;
    private String safetyRequirements;
    private Boolean safetyInspectionRequired;
    private LocalDateTime lastSafetyInspection;
    private String safetyInspectionBy;
    private String classification;
    private String criticality;
    private String barcode;
    private String qrCode;
    private String rfidTag;
    private String inventoryItemId;
    private Boolean isConsumable;
    private Boolean isReturnable;
    private LocalDateTime expectedReturnDate;
    private LocalDateTime actualReturnDate;
    private String returnedTo;
    private String receivedBy;
    private Boolean isDamaged;
    private String damageDescription;
    private LocalDateTime damageDate;
    private String damageReportedBy;
    private Boolean isLost;
    private String lossDescription;
    private LocalDateTime lossDate;
    private String lossReportedBy;
    private String replacementAssetId;
    private Boolean isReplacement;
    private String replacedAssetId;
    private String photoUrls;
    private String documentUrls;
    private String specificationUrls;
    private String notes;
    private String specialInstructions;
    private String technicalSpecifications;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String lastModifiedBy;

    public enum AssetStatus {
        AVAILABLE, IN_USE, MAINTENANCE, REPAIR, RETIRED, LOST, 
        DAMAGED, DISPOSED, RESERVED, TRANSIT
    }

    public enum AssetCondition {
        EXCELLENT, GOOD, FAIR, POOR, DAMAGED, UNSERVICEABLE
    }

    public enum AssetClassification {
        TOOLS, EQUIPMENT, MACHINERY, VEHICLES, SAFETY_EQUIPMENT, 
        CONSUMABLES, SPARE_PARTS, TESTING_EQUIPMENT, COMMUNICATION, 
        COMPUTERS, OTHER
    }

    public enum AssetCriticality {
        LOW, MEDIUM, HIGH, CRITICAL, ESSENTIAL
    }
}
