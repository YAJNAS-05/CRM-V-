package com.everx.erp.equipment.dto;

import com.everx.erp.equipment.EquipmentStatus;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateEquipmentRequest {
    
    @Size(max = 100)
    private String internalCode;

    @Size(max = 100)
    private String make;

    @Size(max = 100)
    private String model;

    @Size(max = 100)
    private String serialNumber;

    @Size(max = 50)
    private String category;

    @Size(max = 100)
    private String sliceConfig;

    @Size(max = 50)
    private String fieldStrength;

    @Size(max = 20)
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
