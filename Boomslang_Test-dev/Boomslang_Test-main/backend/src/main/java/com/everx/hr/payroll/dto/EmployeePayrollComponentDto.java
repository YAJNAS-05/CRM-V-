package com.everx.hr.payroll.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeePayrollComponentDto {
    private UUID id;
    private UUID employeeId;
    private UUID componentId;
    private BigDecimal amount;
    private BigDecimal percentage;
    private Boolean isActive;
    private Instant createdAt;
    private Instant updatedAt;
}
