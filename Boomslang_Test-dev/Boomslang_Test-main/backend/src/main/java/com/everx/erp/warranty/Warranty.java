package com.everx.erp.warranty;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "warranties", schema = "everx_erp")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Warranty extends BaseEntity {

    @Column(name = "equipment_id")
    private UUID equipmentId;

    @Column(name = "so_id")
    private UUID soId;

    @Column(name = "account_id", nullable = false)
    private UUID accountId;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(nullable = false, length = 50)
    private String type;

    @Column(nullable = false, length = 50)
    private String status = "ACTIVE";

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "ppm_schedule", length = 50)
    private String ppmSchedule = "ANNUAL";

    @Column(name = "next_ppm_due")
    private LocalDate nextPpmDue;

    @Column(name = "last_ppm_date")
    private LocalDate lastPpmDate;

    @Column(name = "response_sla_hours")
    private Integer responseSlaHours = 24;

    @Column(name = "compliance_standard", length = 50)
    private String complianceStandard;

    @Column(name = "certification_expiry")
    private LocalDate certificationExpiry;
}
