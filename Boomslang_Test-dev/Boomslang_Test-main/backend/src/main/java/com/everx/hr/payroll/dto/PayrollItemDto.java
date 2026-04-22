package com.everx.hr.payroll.dto;

import com.everx.hr.PayrollItemStatus;
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
public class PayrollItemDto {
    private UUID id;
    private UUID payrollRunId;
    private UUID employeeId;
    private BigDecimal grossPay;
    private BigDecimal deductions;
    private BigDecimal netPay;
    private String currency;
    private PayrollItemStatus status;
    private LocalDate paidDate;
    private Instant createdAt;
    private Instant updatedAt;
}
