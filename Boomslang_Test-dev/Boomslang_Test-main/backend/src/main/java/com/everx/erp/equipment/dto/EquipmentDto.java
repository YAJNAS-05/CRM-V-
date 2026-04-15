package com.everx.erp.equipment.dto;

import com.everx.erp.equipment.EquipmentStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentDto {
    private UUID id;
    private String internalCode;
    private String make;
    private String model;
    private String serialNumber;
    private String category;
    private String sliceConfig;
    private String fieldStrength;
    private String conditionGrade;
    private EquipmentStatus status;
    private String warehouseLocation;
    private BigDecimal acquisitionCost;
    private String acquisitionCurrency;
    private BigDecimal askingPrice;
    private String askingCurrency;
    private Integer yearOfManufacture;
    private Integer hoursOfUse;
    private Boolean tgaCompliant;
    private Boolean ceMarked;
    private Boolean fdaCleared;
    private String locationCountry;
    private String software;
    private String softwareVersion;
    private String tubeType;
    private String installedOptions;
    private String detectorSize;
    private String tubeReplaced;
    private Integer tubeScanSeconds;
    private Integer numRxChannels;
    private String coils;
    private String choiceOfProbes;
    private String tubeManufactured;
    private String flatDetectorManufactured;
    private String notes;
    private String[] images;
    private Instant createdAt;
    private Instant updatedAt;
}
