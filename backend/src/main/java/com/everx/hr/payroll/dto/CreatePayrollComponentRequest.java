package com.everx.hr.payroll.dto;

import com.everx.hr.PayrollCalculationType;
import com.everx.hr.PayrollComponentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreatePayrollComponentRequest {
    @NotBlank(message = "Component code is required")
    private String code;

    @NotBlank(message = "Component name is required")
    private String name;

    @NotNull(message = "Component type is required")
    private PayrollComponentType componentType;

    private PayrollCalculationType calculationType;
    private BigDecimal defaultAmount;
    private BigDecimal defaultPercentage;
    private Boolean taxable;
    private Boolean isActive;
    private String description;
}
