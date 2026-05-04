package com.everx.hr.leave.dto;

import com.everx.hr.LeaveType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdjustLeaveBalanceRequest {
    @NotNull(message = "Employee ID is required")
    private UUID employeeId;

    @NotNull(message = "Leave type is required")
    private LeaveType leaveType;

    private BigDecimal deltaAvailable;
    private BigDecimal deltaUsed;
    private BigDecimal deltaPending;
    private String reason;
}
