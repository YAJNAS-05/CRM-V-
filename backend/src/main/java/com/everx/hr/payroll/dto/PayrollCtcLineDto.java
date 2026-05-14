package com.everx.hr.payroll.dto;

import com.everx.hr.PayrollCalculationType;
import com.everx.hr.PayrollComponentType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PayrollCtcLineDto {
    private UUID componentId;
    private String code;
    private String name;
    private PayrollComponentType componentType;
    private PayrollCalculationType calculationType;
    private BigDecimal annualAmount;
    private BigDecimal monthlyAmount;
    private BigDecimal percentageUsed;
}
