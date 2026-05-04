package com.everx.hr.payslip.dto;

import com.everx.hr.payslip.PayslipStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PayslipDto {
    private UUID id;
    private UUID employeeId;
    private UUID payrollRunId;
    private LocalDate payPeriodStart;
    private LocalDate payPeriodEnd;
    private BigDecimal grossPay;
    private BigDecimal deductions;
    private BigDecimal netPay;
    private BigDecimal taxAmount;
    private String currency;
    private PayslipStatus status;
    private String notes;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
