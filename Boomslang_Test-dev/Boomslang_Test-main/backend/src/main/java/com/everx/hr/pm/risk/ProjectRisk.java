package com.everx.hr.pm.risk;

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
@Table(name = "pm_risks", schema = "everx_hr")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProjectRisk extends BaseEntity {

    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "severity", nullable = false, length = 20)
    private String severity = "MEDIUM";

    @Column(name = "status", nullable = false, length = 30)
    private String status = "OPEN";

    @Column(name = "owner_id")
    private UUID ownerId;

    @Column(name = "mitigation_plan", columnDefinition = "TEXT")
    private String mitigationPlan;

    @Column(name = "due_date")
    private LocalDate dueDate;
}
