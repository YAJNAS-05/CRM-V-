package com.everx.erp.equipment.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateEquipmentQCRecordRequest {

    private UUID equipmentId;

    private UUID acquisitionId;

    @NotNull(message = "QC date is required")
    private LocalDate qcDate;

    @Size(max = 255)
    private String engineerAssigned;

    @NotBlank(message = "Phantom scan result is required")
    @Size(max = 20)
    private String phantomScanResult;

    @Min(1)
    @Max(5)
    private Integer imageQualityRating;

    @NotBlank(message = "Overall result is required")
    @Size(max = 50)
    private String overallResult;

    private String qcNotes;
}
