package com.everx.hr.payroll.dto;

import com.everx.hr.PayFrequency;
import com.everx.hr.PayType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePayrollProfileRequest {
    private UUID employeeId;
    private PayType payType;
    private PayFrequency payFrequency;
    private BigDecimal salaryAmount;
    private BigDecimal hourlyRate;
    private String currency;
    private String taxId;
    private String bankAccountMasked;
}
