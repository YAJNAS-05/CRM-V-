package com.everx.hr.payslip.dto;

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
public class CreatePayslipRequest {

    @NotNull(message = "Employee ID is required")
    private UUID employeeId;

    private UUID payrollRunId;

    @NotNull(message = "Pay period start is required")
    private LocalDate payPeriodStart;

    @NotNull(message = "Pay period end is required")
    private LocalDate payPeriodEnd;

    private BigDecimal grossPay;
    private BigDecimal deductions;
    private BigDecimal netPay;
    private BigDecimal taxAmount;
    private String currency;
    private String notes;
}
