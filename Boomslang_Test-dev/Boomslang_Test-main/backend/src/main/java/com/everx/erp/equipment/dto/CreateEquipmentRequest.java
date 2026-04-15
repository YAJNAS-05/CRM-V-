package com.everx.erp.equipment.dto;

import com.everx.erp.equipment.EquipmentStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateEquipmentRequest {
    
    @NotBlank(message = "Internal code is required")
    private String internalCode;

    @NotBlank(message = "Make is required")
    private String make;

    @NotBlank(message = "Model is required")
    private String model;

    private String serialNumber;

    private String category;

    private String sliceConfig;

    private String fieldStrength;

    private String conditionGrade;

    private EquipmentStatus status;

    @Size(max = 50)
    private String warehouseLocation;

    private BigDecimal acquisitionCost;

    @Size(max = 3)
    private String acquisitionCurrency;

    private BigDecimal askingPrice;

    @Size(max = 3)
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
}
