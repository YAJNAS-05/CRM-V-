package com.everx.erp.assessment;

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
@Table(name = "equipment_assessments", schema = "everx_erp")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentAssessment extends BaseEntity {

    @Column(name = "assessment_number", nullable = false, unique = true, length = 50)
    private String assessmentNumber;

    @Column(name = "acquisition_id")
    private UUID acquisitionId;

    @Column(name = "equipment_id")
    private UUID equipmentId;

    @Column(name = "assessment_type", nullable = false, length = 50)
    private String assessmentType;

    @Column(name = "inspection_date")
    private LocalDate inspectionDate;

    @Column(name = "engineer_assigned", length = 255)
    private String engineerAssigned;

    @Column(name = "tube_life_remaining")
    private Integer tubeLifeRemaining;

    @Column(name = "image_quality_rating")
    private Integer imageQualityRating;

    @Column(name = "condition_grade", length = 20)
    private String conditionGrade;

    @Column(nullable = false, length = 50)
    private String outcome;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
