package com.everx.hr.timesheet.dto;

import com.everx.hr.TimesheetStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTimesheetRequest {
    private UUID fieldJobId;
    private LocalDate workDate;
    private BigDecimal hoursWorked;
    private TimesheetStatus status;
    private String notes;
}
