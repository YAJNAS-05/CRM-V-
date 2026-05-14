package com.everx.hr.payroll.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpsertEmployeePayrollComponentRequest {
    @NotNull(message = "Component ID is required")
    private UUID componentId;

    private BigDecimal amount;
    private BigDecimal percentage;
    private Boolean isActive;
}
