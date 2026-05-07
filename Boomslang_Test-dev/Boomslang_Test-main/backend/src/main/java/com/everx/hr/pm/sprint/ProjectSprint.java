package com.everx.hr.pm.sprint;

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
@Table(name = "pm_sprints", schema = "everx_hr")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProjectSprint extends BaseEntity {

    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "goal", columnDefinition = "TEXT")
    private String goal;

    @Column(name = "status", nullable = false, length = 50)
    private String status = "PLANNED";

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "capacity_hours", precision = 10, scale = 2)
    private BigDecimal capacityHours;
}
