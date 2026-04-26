package com.everx.erp.equipment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentQCRecordDto {
    private UUID id;
    private String qcNumber;
    private UUID equipmentId;
    private UUID acquisitionId;
    private LocalDate qcDate;
    private String engineerAssigned;
    private String phantomScanResult;
    private Integer imageQualityRating;
    private String overallResult;
    private String qcNotes;
    private Instant createdAt;
    private Instant updatedAt;
}
