package com.everx.hr.timesheet;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "timesheets", schema = "everx_hr")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Timesheet extends BaseEntity {

    @Column(name = "employee_id", nullable = false)
    private UUID employeeId;

    @Column(name = "field_job_id")
    private UUID fieldJobId;

    @Column(name = "work_date", nullable = false)
    private LocalDate workDate;

    @Column(name = "week_start_date")
    private LocalDate weekStartDate;

    @Column(name = "hours_worked", precision = 10, scale = 2)
    private BigDecimal hoursWorked;

    @Column(name = "total_billable_hours", precision = 10, scale = 2)
    private BigDecimal totalBillableHours;

    @Column(name = "total_non_billable_hours", precision = 10, scale = 2)
    private BigDecimal totalNonBillableHours;

    @Column(name = "total_hours", precision = 10, scale = 2)
    private BigDecimal totalHours;

    @Column(name = "status", nullable = false, length = 50)
    private String status = "DRAFT";

    @Column(name = "approved_by")
    private UUID approvedBy;

    @Column(name = "approved_at")
    private OffsetDateTime approvedAt;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}
