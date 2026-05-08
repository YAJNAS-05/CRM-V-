package com.everx.erp.assessment;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import java.util.UUID;

@Entity
@Table(name = "asset_assessment", schema = "everx_erp")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class AssetAssessment extends BaseEntity {
    @Column(name = "asset_id", nullable = false)
    private UUID assetId;
    @Column(name = "assessment_date")
    private java.time.LocalDate assessmentDate;
    @Column(name = "condition_score")
    private Integer conditionScore;
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    @Column(name = "assessed_by")
    private UUID assessedBy;
}
