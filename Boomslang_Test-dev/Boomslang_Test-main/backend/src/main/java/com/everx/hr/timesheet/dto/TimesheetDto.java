package com.everx.hr.timesheet.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TimesheetDto {
    private UUID id;
    private UUID employeeId;
    private UUID fieldJobId;
    private LocalDate workDate;
    private LocalDate weekStartDate;
    private BigDecimal hoursWorked;
    private BigDecimal totalBillableHours;
    private BigDecimal totalNonBillableHours;
    private BigDecimal totalHours;
    private String status;
    private UUID approvedBy;
    private OffsetDateTime approvedAt;
    private String notes;
    private Instant createdAt;
    private Instant updatedAt;
}
