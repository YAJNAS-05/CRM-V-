package com.everx.crm.deal;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "deal_stage_config", schema = "everx_crm")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DealStageConfig extends BaseEntity {

    @Column(name = "stage_name", nullable = false, length = 50)
    private String stageName;

    @Column(name = "stage_order", nullable = false)
    private Integer stageOrder;

    @Column(name = "color_code", length = 10)
    private String colorCode;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}
