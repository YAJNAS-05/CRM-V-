package com.everx.erp.equipment;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

/**
 * Equipment QC Workflow Endpoints
 * Manages equipment quality control and status transitions
 * 
 * Base Path: /api/v1/equipment
 */
@RestController
@RequestMapping("/api/v1/equipment")
@RequiredArgsConstructor
public class EquipmentQCController {

    private final EquipmentQCService equipmentQCService;

    /**
     * WORKFLOW TRIGGER: Pass equipment QC
     * Transitions equipment from IN_REFURBISHMENT to AVAILABLE
     * 
     * PUT /api/v1/equipment/{equipmentId}/qc/pass
     */
    @PutMapping("/{equipmentId}/qc/pass")
    public ResponseEntity<?> passEquipmentQC(
            @PathVariable UUID equipmentId,
            @RequestParam(required = false) String notes) {
        try {
            Equipment equipment = equipmentQCService.passEquipmentQC(equipmentId, notes);
            return ResponseEntity.ok(equipment);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    /**
     * WORKFLOW TRIGGER: Fail equipment QC
     * Marks equipment as failed QC; moves to IN_MAINTENANCE
     * 
     * PUT /api/v1/equipment/{equipmentId}/qc/fail
     */
    @PutMapping("/{equipmentId}/qc/fail")
    public ResponseEntity<?> failEquipmentQC(
            @PathVariable UUID equipmentId,
            @RequestParam String failureReason) {
        try {
            Equipment equipment = equipmentQCService.failEquipmentQC(equipmentId, failureReason);
            return ResponseEntity.ok(equipment);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    /**
     * Conditional QC Pass
     * Marks equipment as passed QC with conditions (e.g., minor cosmetic damage)
     * 
     * PUT /api/v1/equipment/{equipmentId}/qc/conditional-pass
     */
    @PutMapping("/{equipmentId}/qc/conditional-pass")
    public ResponseEntity<?> conditionalQCPass(
            @PathVariable UUID equipmentId,
            @RequestParam String conditions) {
        try {
            Equipment equipment = equipmentQCService.conditionalQCPass(equipmentId, conditions);
            return ResponseEntity.ok(equipment);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    /**
     * Get Equipment QC Status
     * 
     * GET /api/v1/equipment/{equipmentId}/qc/status
     */
    @GetMapping("/{equipmentId}/qc/status")
    public ResponseEntity<?> getEquipmentQCStatus(@PathVariable UUID equipmentId) {
        try {
            Equipment equipment = equipmentQCService.getEquipmentQCStatus(equipmentId);
            return ResponseEntity.ok(equipment);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("{\"error\": \"Equipment not found\"}");
        }
    }
}
