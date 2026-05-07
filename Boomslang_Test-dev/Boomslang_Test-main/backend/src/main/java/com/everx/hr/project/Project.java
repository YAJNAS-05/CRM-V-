package com.everx.hr.project;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "projects", schema = "everx_hr")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Project extends BaseEntity {

    @Column(name = "project_code")
    private String projectCode;

    @Column(name = "project_name", nullable = false)
    private String projectName;

    @Column(name = "owner_id", nullable = false)
    private UUID ownerId;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "status", nullable = false, length = 50)
    private String status = "PLANNING";

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "budget", precision = 15, scale = 2)
    private BigDecimal budget;

    @Column(name = "currency", length = 3)
    private String currency;

    @Column(name = "linked_field_job_id")
    private UUID linkedFieldJobId;
}
