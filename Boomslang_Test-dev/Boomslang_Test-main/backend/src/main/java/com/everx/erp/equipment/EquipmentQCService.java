package com.everx.erp.equipment;

import com.everx.erp.numbering.DocumentNumberGenerator;
import com.everx.shared.exception.EntityNotFoundException;
import com.everx.shared.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Equipment QC (Quality Control) Service
 * Manages the QC workflow and Equipment status transitions
 * 
 * WORKFLOW TRIGGER: When QC test passes, Equipment transitions to AVAILABLE state
 */
@Service
@RequiredArgsConstructor
public class EquipmentQCService {

    private final EquipmentRepository equipmentRepository;
    private final EquipmentQCRecordRepository equipmentQCRecordRepository;
    private final DocumentNumberGenerator documentNumberGenerator;

    /**
     * WORKFLOW TRIGGER: Pass Equipment QC
     * Sets QC test result to PASS and transitions Equipment to AVAILABLE physical status
     */
    @Transactional
    public Equipment passEquipmentQC(UUID equipmentId, String qcNotes) {
        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new EntityNotFoundException("Equipment not found with id: " + equipmentId));

        // Validate equipment is in refurbishment
        if (equipment.getPhysicalStatus() != null && 
            !equipment.getPhysicalStatus().equals(PhysicalStatus.IN_REFURBISHMENT)) {
            throw new ValidationException("Equipment must be IN_REFURBISHMENT to undergo QC testing. Current status: " 
                + equipment.getPhysicalStatus());
        }

        // Set QC test result to PASS
        equipment.setQcTestResult("PASS");
        equipment.setQcTestDate(LocalDate.now());
        equipment.setQcNotes(qcNotes);

        // WORKFLOW TRIGGER: Transition to AVAILABLE
        equipment.setPhysicalStatus(PhysicalStatus.AVAILABLE);

        createQCRecord(equipmentId, "PASS", "PASS", qcNotes);

        return equipmentRepository.save(equipment);
    }

    /**
     * WORKFLOW TRIGGER: Fail Equipment QC
     * Sets QC test result to FAIL; equipment cannot transition to AVAILABLE
     */
    @Transactional
    public Equipment failEquipmentQC(UUID equipmentId, String failureReason) {
        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new EntityNotFoundException("Equipment not found with id: " + equipmentId));

        // Set QC test result to FAIL
        equipment.setQcTestResult("FAIL");
        equipment.setQcTestDate(LocalDate.now());
        equipment.setQcNotes(failureReason);

        // Equipment stays in IN_REFURBISHMENT or moves to UNDER_MAINTENANCE for repair
        equipment.setPhysicalStatus(PhysicalStatus.IN_MAINTENANCE);

        createQCRecord(equipmentId, "FAIL", "FAIL", failureReason);

        return equipmentRepository.save(equipment);
    }

    /**
     * Get Equipment QC Status
     */
    public Equipment getEquipmentQCStatus(UUID equipmentId) {
        return equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new EntityNotFoundException("Equipment not found with id: " + equipmentId));
    }

    /**
     * Mark Equipment as ready for sale (conditional QC pass)
     * For equipment that passes QC with minor issues but is still usable
     */
    @Transactional
    public Equipment conditionalQCPass(UUID equipmentId, String conditions) {
        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new EntityNotFoundException("Equipment not found with id: " + equipmentId));

        equipment.setQcTestResult("CONDITIONAL");
        equipment.setQcTestDate(LocalDate.now());
        equipment.setQcNotes("Conditional approval with conditions: " + conditions);
        equipment.setPhysicalStatus(PhysicalStatus.AVAILABLE);

        createQCRecord(equipmentId, "PASS", "CONDITIONAL_PASS", "Conditional approval with conditions: " + conditions);

        return equipmentRepository.save(equipment);
    }

    private void createQCRecord(UUID equipmentId, String scanResult, String overallResult, String notes) {
        EquipmentQCRecord record = new EquipmentQCRecord();
        record.setQcNumber(generateQcNumber());
        record.setEquipmentId(equipmentId);
        record.setQcDate(LocalDate.now());
        record.setPhantomScanResult(scanResult);
        record.setOverallResult(overallResult);
        record.setQcNotes(notes);
        equipmentQCRecordRepository.save(record);
    }

    private String generateQcNumber() {
        return documentNumberGenerator.generate(
                "QC",
                candidate -> equipmentQCRecordRepository.findByQcNumber(candidate).isPresent()
        );
    }
}
