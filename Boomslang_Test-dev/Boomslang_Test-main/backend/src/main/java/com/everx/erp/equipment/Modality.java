package com.everx.erp.equipment;

/**
 * Medical equipment modality classification based on EverX product catalog
 * Represents the type of diagnostic/imaging equipment
 */
public enum Modality {
    CT,                    // CT Scanners (16-slice, 64-slice, 128-slice, etc.)
    MRI,                   // MRI Scanners (1.5T, 3T — closed/open bore)
    ULTRASOUND,            // Ultrasound machines (general, cardiac, vascular)
    CATH_ANGIO,            // Catheterization & Angiography Labs
    MAMMOGRAPHY,           // Digital/analogue mammography systems
    MOLECULAR_IMAGING,     // PET/CT, SPECT scanners
    XRAY_FLUOROSCOPY,      // Digital X-Ray, Fluoroscopy systems
    C_ARM_OPG_DEXA         // Mobile C-Arm, OPG, DEXA
}
