package com.everx.hr.payroll.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeCompensationDto {
    private UUID id;
    private UUID employeeId;
    private BigDecimal annualCtc;
    private String currency;
    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;
    private Instant createdAt;
    private Instant updatedAt;
}
