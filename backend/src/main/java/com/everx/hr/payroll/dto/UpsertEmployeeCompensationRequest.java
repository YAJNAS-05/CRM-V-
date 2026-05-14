package com.everx.hr.payroll.dto;

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
public class UpsertEmployeeCompensationRequest {
    @NotNull(message = "Employee ID is required")
    private UUID employeeId;

    @NotNull(message = "Annual CTC is required")
    private BigDecimal annualCtc;

    private String currency;
    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;
}
