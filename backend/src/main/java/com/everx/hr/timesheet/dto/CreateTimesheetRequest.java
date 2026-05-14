package com.everx.hr.timesheet.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateTimesheetRequest {
    @NotNull(message = "Employee ID is required")
    private UUID employeeId;

    private UUID fieldJobId;

    @NotNull(message = "Work date is required")
    private LocalDate workDate;

    private BigDecimal hoursWorked;
    private String notes;
}
