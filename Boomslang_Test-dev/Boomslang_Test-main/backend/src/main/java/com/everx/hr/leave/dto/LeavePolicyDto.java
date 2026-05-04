package com.everx.hr.leave.dto;

import com.everx.hr.AccrualFrequency;
import com.everx.hr.LeaveType;
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
public class LeavePolicyDto {
    private UUID id;
    private String name;
    private LeaveType leaveType;
    private BigDecimal annualEntitlement;
    private AccrualFrequency accrualFrequency;
    private BigDecimal carryForwardLimit;
    private BigDecimal maxBalance;
    private Boolean allowNegative;
    private Boolean requiresApproval;
    private Integer minServiceDays;
    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;
    private Boolean isActive;
    private String description;
    private Instant createdAt;
    private Instant updatedAt;
}
