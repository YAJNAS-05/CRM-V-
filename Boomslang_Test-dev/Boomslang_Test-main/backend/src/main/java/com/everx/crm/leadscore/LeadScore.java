package com.everx.crm.leadscore;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "lead_scores", schema = "everx_crm")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LeadScore extends BaseEntity {

    @Column(name = "lead_id", nullable = false)
    private UUID leadId;

    @Column(name = "score_type", nullable = false, length = 50)
    private String scoreType;

    @Column(name = "points", nullable = false)
    private Integer points;
}
