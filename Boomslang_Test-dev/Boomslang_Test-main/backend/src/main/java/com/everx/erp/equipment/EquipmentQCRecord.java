package com.everx.erp.equipment;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "equipment_qc_records", schema = "everx_erp")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentQCRecord extends BaseEntity {

    @Column(name = "qc_number", nullable = false, unique = true, length = 50)
    private String qcNumber;

    @Column(name = "equipment_id", nullable = false)
    private UUID equipmentId;

    @Column(name = "acquisition_id")
    private UUID acquisitionId;

    @Column(name = "qc_date", nullable = false)
    private LocalDate qcDate;

    @Column(name = "engineer_assigned", length = 255)
    private String engineerAssigned;

    @Column(name = "phantom_scan_result", nullable = false, length = 20)
    private String phantomScanResult;

    @Column(name = "image_quality_rating")
    private Integer imageQualityRating;

    @Column(name = "overall_result", nullable = false, length = 50)
    private String overallResult;

    @Column(name = "qc_notes", columnDefinition = "TEXT")
    private String qcNotes;
}
