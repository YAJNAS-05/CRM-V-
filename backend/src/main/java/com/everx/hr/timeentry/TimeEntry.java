package com.everx.hr.timeentry;

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
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "time_entries", schema = "everx_hr")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TimeEntry extends BaseEntity {

    @Column(name = "employee_id", nullable = false)
    private UUID employeeId;

    @Column(name = "task_id")
    private UUID taskId;

    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @Column(name = "start_time", nullable = false)
    private OffsetDateTime startTime;

    @Column(name = "end_time")
    private OffsetDateTime endTime;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "work_date")
    private LocalDate workDate;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "billable", nullable = false)
    private Boolean billable = false;

    @Column(name = "rate_per_hour", precision = 10, scale = 2)
    private BigDecimal ratePerHour;

    @Column(name = "timesheet_id")
    private UUID timesheetId;
}
