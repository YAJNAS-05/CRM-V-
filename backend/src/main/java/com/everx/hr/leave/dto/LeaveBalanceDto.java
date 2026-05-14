package com.everx.hr.leave.dto;

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
public class LeaveBalanceDto {
    private UUID id;
    private UUID employeeId;
    private LeaveType leaveType;
    private BigDecimal availableDays;
    private BigDecimal usedDays;
    private BigDecimal pendingDays;
    private LocalDate lastAccruedOn;
    private Instant createdAt;
    private Instant updatedAt;
}
