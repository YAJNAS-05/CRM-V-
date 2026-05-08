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
import java.util.UUID;

@Entity
@Table(name = "field_work_assets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class FieldWorkAsset extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String fieldJobId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "field_job_id", insertable = false, updatable = false)
    private FieldJob fieldJob;

    @Column(nullable = false)
    private String assetTag;

    @Column(nullable = false)
    private String assetName;

    @Column(nullable = false)
    private String assetDescription;

    @Column(nullable = false)
    private String assetCategory;

    @Column(nullable = false)
    private String assetType;

    @Column(nullable = false)
    private String manufacturer;

    @Column
    private String model;

    @Column
    private String serialNumber;

    @Column
    private String partNumber;

    // ERP integration fields
    @Column
    private String erpItemId;

    @Column
    private String erpAssetId;

    @Column
    private String erpLocationId;

    @Column
    private String erpWarehouseId;

    // Asset status and condition
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssetStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssetCondition condition;

    @Column(columnDefinition = "TEXT")
    private String conditionNotes;

    @Column
    private LocalDateTime lastInspectionDate;

    @Column
    private String lastInspectedBy;

    @Column(columnDefinition = "TEXT")
    private String inspectionNotes;

    // Quantity and measurements
    @Column(nullable = false)
    private BigDecimal quantity = BigDecimal.ONE;

    @Column
    private String unitOfMeasure;

    @Column(precision = 19, scale = 6)
    private BigDecimal weight; // in kg

    @Column(precision = 19, scale = 4)
    private BigDecimal volume; // in cubic meters

    @Column
    private String dimensions; // LxWxH format

    // Financial information
    @Column(precision = 19, scale = 2)
    private BigDecimal unitCost;

    @Column(precision = 19, scale = 2)
    private BigDecimal totalCost;

    @Column
    private String currency = "USD";

    @Column
    private LocalDateTime purchaseDate;

    @Column
    private String supplier;

    @Column
    private String purchaseOrderNumber;

    // Warranty and maintenance
    @Column
    private LocalDateTime warrantyExpiryDate;

    @Column
    private String warrantyProvider;

    @Column(columnDefinition = "TEXT")
    private String warrantyTerms;

    @Column
    private LocalDateTime lastMaintenanceDate;

    @Column
    private LocalDateTime nextMaintenanceDate;

    @Column(columnDefinition = "TEXT")
    private String maintenanceNotes;

    // Usage tracking
    @Column(nullable = false)
    private Integer usageCount = 0;

    @Column
    private LocalDateTime firstUsedDate;

    @Column
    private LocalDateTime lastUsedDate;

    @Column
    private String usedBy;

    // Location tracking
    @Column
    private String currentLocation;

    @Column(precision = 10, scale = 6)
    private Double currentLatitude;

    @Column(precision = 10, scale = 6)
    private Double currentLongitude;

    @Column
    private LocalDateTime locationUpdatedDate;

    // Safety and compliance
    @Column(nullable = false)
    private Boolean requiresSafetyTraining = false;

    @Column(columnDefinition = "TEXT")
    private String safetyRequirements;

    @Column(nullable = false)
    private Boolean safetyInspectionRequired = false;

    @Column
    private LocalDateTime lastSafetyInspection;

    @Column
    private String safetyInspectionBy;

    // Asset classification
    @Enumerated(EnumType.STRING)
    private AssetClassification classification;

    @Enumerated(EnumType.STRING)
    private AssetCriticality criticality;

    @Column
    private String barcode;

    @Column
    private String qrCode;

    @Column
    private String rfidTag;

    // Integration with inventory
    @Column
    private String inventoryItemId;

    @Column
    private Boolean isConsumable = false;

    @Column
    private Boolean isReturnable = true;

    @Column
    private LocalDateTime expectedReturnDate;

    @Column
    private LocalDateTime actualReturnDate;

    @Column
    private String returnedTo;

    @Column
    private String receivedBy;

    // Damage and loss tracking
    @Column(nullable = false)
    private Boolean isDamaged = false;

    @Column(columnDefinition = "TEXT")
    private String damageDescription;

    @Column
    private LocalDateTime damageDate;

    @Column
    private String damageReportedBy;

    @Column(nullable = false)
    private Boolean isLost = false;

    @Column(columnDefinition = "TEXT")
    private String lossDescription;

    @Column
    private LocalDateTime lossDate;

    @Column
    private String lossReportedBy;

    // Replacement information
    @Column
    private String replacementAssetId;

    @Column
    private Boolean isReplacement = false;

    @Column
    private String replacedAssetId;

    // Photos and documentation
    @Column(columnDefinition = "TEXT")
    private String photoUrls; // JSON array of URLs

    @Column(columnDefinition = "TEXT")
    private String documentUrls; // JSON array of URLs

    @Column(columnDefinition = "TEXT")
    private String specificationUrls; // JSON array of URLs

    // Notes and additional information
    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(columnDefinition = "TEXT")
    private String specialInstructions;

    @Column(columnDefinition = "TEXT")
    private String technicalSpecifications;

    // Audit fields
    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Column(nullable = false)
    private String createdBy;

    @Column(nullable = false)
    private String lastModifiedBy;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum AssetStatus {
        AVAILABLE,
        IN_USE,
        MAINTENANCE,
        REPAIR,
        RETIRED,
        LOST,
        DAMAGED,
        DISPOSED,
        RESERVED,
        TRANSIT
    }

    public enum AssetCondition {
        EXCELLENT,
        GOOD,
        FAIR,
        POOR,
        DAMAGED,
        UNSERVICEABLE
    }

    public enum AssetClassification {
        TOOLS,
        EQUIPMENT,
        MACHINERY,
        VEHICLES,
    SAFETY_EQUIPMENT,
        CONSUMABLES,
        SPARE_PARTS,
    TESTING_EQUIPMENT,
    COMMUNICATION,
    COMPUTERS,
    OTHER
    }

    public enum AssetCriticality {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL,
        ESSENTIAL
    }
}
