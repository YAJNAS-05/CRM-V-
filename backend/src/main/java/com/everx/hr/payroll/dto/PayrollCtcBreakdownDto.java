package com.everx.hr.payroll.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PayrollCtcBreakdownDto {
    private UUID employeeId;
    private BigDecimal annualCtc;
    private BigDecimal monthlyCtc;
    private String currency;
    private BigDecimal totalEarningsMonthly;
    private BigDecimal totalDeductionsMonthly;
    private List<PayrollCtcLineDto> items;
}
