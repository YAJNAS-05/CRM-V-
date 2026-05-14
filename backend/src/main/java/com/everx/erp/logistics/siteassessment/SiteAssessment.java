package com.everx.erp.logistics.siteassessment;

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
@Table(name = "site_assessments", schema = "everx_erp")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SiteAssessment extends BaseEntity {

    @Column(name = "assessment_number", nullable = false, unique = true, length = 50)
    private String assessmentNumber;

    @Column(name = "sales_order_id")
    private UUID salesOrderId;

    @Column(name = "account_id", nullable = false)
    private UUID accountId;

    @Column(name = "assessment_method", length = 50)
    private String assessmentMethod;

    @Column(name = "room_dimensions", length = 100)
    private String roomDimensions;

    @Column(name = "power_compliant")
    private Boolean powerCompliant;

    @Column(name = "shielding_type", length = 50)
    private String shieldingType;

    @Column(name = "cooling_capacity", length = 100)
    private String coolingCapacity;

    @Column(name = "network_readiness", length = 100)
    private String networkReadiness;

    @Column(name = "overall_readiness", nullable = false, length = 50)
    private String overallReadiness = "PENDING";

    @Column(name = "remediation_required", columnDefinition = "TEXT")
    private String remediationRequired;

    @Column(name = "assessed_date")
    private LocalDate assessedDate;

    @Column(name = "room_sign_off_date")
    private LocalDate roomSignOffDate;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
