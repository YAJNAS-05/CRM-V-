package com.everx.hr.payroll.dto;

import com.everx.hr.PayrollCalculationType;
import com.everx.hr.PayrollComponentType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePayrollComponentRequest {
    private String code;
    private String name;
    private PayrollComponentType componentType;
    private PayrollCalculationType calculationType;
    private BigDecimal defaultAmount;
    private BigDecimal defaultPercentage;
    private Boolean taxable;
    private Boolean isActive;
    private String description;
}
