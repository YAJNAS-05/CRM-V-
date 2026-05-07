package com.everx.crm.deal;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "deals", schema = "everx_crm")
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = false)
public class Deal extends BaseEntity {

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "stage", nullable = false)
    private String stage;

    @Column(name = "amount")
    private BigDecimal amount;

    @Column(name = "probability")
    private Integer probability;

    @Column(name = "days_in_stage")
    private Integer daysInStage;

    @Column(name = "days_in_pipeline")
    private Integer daysInPipeline;

    @Column(name = "expected_revenue_weighted", precision = 15, scale = 2)
    private BigDecimal expectedRevenueWeighted;

    @Column(name = "expected_close_date")
    private LocalDate expectedCloseDate;

    @Column(name = "actual_close_date")
    private LocalDate actualCloseDate;

    @Column(name = "lead_source", length = 50)
    private String leadSource;

    @Column(name = "account_id")
    private UUID accountId;

    @Column(name = "primary_contact_id")
    private UUID primaryContactId;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "loss_reason", columnDefinition = "TEXT")
    private String lossReason;

    @Column(name = "next_step")
    private String nextStep;

    @Column(name = "campaign_source", length = 100)
    private String campaignSource;

    @Column(name = "owner_id")
    private UUID ownerId;

    // Legacy fields kept for backward compatibility
    @Column(name = "lead_id")
    private UUID leadId;

    @Column(name = "currency", length = 3)
    private String currency;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}
