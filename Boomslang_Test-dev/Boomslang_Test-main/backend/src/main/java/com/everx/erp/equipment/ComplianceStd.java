package com.everx.erp.equipment;

/**
 * Regulatory and compliance standards for medical equipment
 * Tracks which certifications and standards the equipment complies with
 */
public enum ComplianceStd {
    TGA,                   // Therapeutic Goods Administration (Australia)
    FDA,                   // Food and Drug Administration (USA)
    CE,                    // Conformité Européenne (European Union)
    IEC,                   // International Electrotechnical Commission
    KFDA,                  // Korea Food and Drug Administration
    PMDA,                  // Pharmaceuticals and Medical Devices Agency (Japan)
    HSA,                   // Health Sciences Authority (Singapore)
    NONE                   // No specific compliance standard
}
