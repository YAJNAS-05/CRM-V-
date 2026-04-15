package com.everx.erp.equipment;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "equipment", schema = "everx_erp")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Equipment extends BaseEntity {

    @Column(name = "internal_code", unique = true, nullable = false, length = 100)
    private String internalCode;

    @Column(length = 100)
    private String make;

    @Column(length = 100)
    private String model;

    @Column(name = "serial_number", length = 100)
    private String serialNumber;

    @Column(length = 50)
    private String category;

    @Column(name = "slice_config", length = 100)
    private String sliceConfig;

    @Column(name = "field_strength", length = 50)
    private String fieldStrength;

    @Column(name = "condition_grade", length = 20)
    private String conditionGrade;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private EquipmentStatus status = EquipmentStatus.IN_STOCK;

    @Column(name = "warehouse_location", length = 50)
    private String warehouseLocation;

    @Column(name = "acquisition_cost", precision = 15, scale = 2)
    private BigDecimal acquisitionCost;

    @Column(name = "acquisition_currency", length = 3)
    private String acquisitionCurrency;

    @Column(name = "asking_price", precision = 15, scale = 2)
    private BigDecimal askingPrice;

    @Column(name = "asking_currency", length = 3)
    private String askingCurrency;

    @Column(name = "year_of_manufacture")
    private Integer yearOfManufacture;

    @Column(name = "hours_of_use")
    private Integer hoursOfUse;

    @Column(name = "tga_compliant")
    private Boolean tgaCompliant = false;

    @Column(name = "ce_marked")
    private Boolean ceMarked = false;

    @Column(name = "fda_cleared")
    private Boolean fdaCleared = false;

    @Column(name = "location_country", length = 100)
    private String locationCountry;

    @Column(length = 255)
    private String software;

    @Column(name = "software_version", length = 255)
    private String softwareVersion;

    @Column(name = "tube_type", length = 255)
    private String tubeType;

    @Column(name = "installed_options", columnDefinition = "TEXT")
    private String installedOptions;

    @Column(name = "detector_size", length = 100)
    private String detectorSize;

    @Column(name = "tube_replaced", length = 100)
    private String tubeReplaced;

    @Column(name = "tube_scan_seconds")
    private Integer tubeScanSeconds;

    @Column(name = "num_rx_channels")
    private Integer numRxChannels;

    @Column(columnDefinition = "TEXT")
    private String coils;

    @Column(name = "choice_of_probes", columnDefinition = "TEXT")
    private String choiceOfProbes;

    @Column(name = "tube_manufactured", length = 100)
    private String tubeManufactured;

    @Column(name = "flat_detector_manufactured", length = 100)
    private String flatDetectorManufactured;

    // Spec-compliant status fields (separate physical and commercial states)
    @Column(nullable = true)
    @Enumerated(EnumType.STRING)
    private PhysicalStatus physicalStatus = PhysicalStatus.AVAILABLE;

    @Column(nullable = true)
    @Enumerated(EnumType.STRING)
    private CommercialStatus commercialStatus = CommercialStatus.LEAD;

    @Column(nullable = true)
    @Enumerated(EnumType.STRING)
    private Modality modality;

    @Column(nullable = true)
    @Enumerated(EnumType.STRING)
    private ComplianceStd complianceStandard;

    // QC and refurbishment tracking
    @Column(name = "qc_test_result", length = 20)
    private String qcTestResult; // PASS, FAIL, CONDITIONAL

    @Column(name = "qc_test_date")
    private java.time.LocalDate qcTestDate;

    @Column(name = "qc_notes", columnDefinition = "TEXT")
    private String qcNotes;

    @Column(name = "refurb_start_date")
    private java.time.LocalDate refurbStartDate;

    @Column(name = "refurb_end_date")
    private java.time.LocalDate refurbEndDate;

    @Column(name = "lead_refurb_engineer", length = 100)
    private String leadRefurbEngineer;

    @Column(name = "tube_life_remaining")
    private Integer tubeLifeRemaining; // 0-100 percentage for CT/MRI

    @Column(name = "image_quality_rating")
    private Integer imageQualityRating; // 1-5 rating

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(columnDefinition = "TEXT[]")
    private String[] images;
}
