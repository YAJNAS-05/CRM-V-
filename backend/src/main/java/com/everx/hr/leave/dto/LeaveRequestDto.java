package com.everx.hr.leave.dto;

import com.everx.hr.LeaveStatus;
import com.everx.hr.LeaveType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaveRequestDto {
    private UUID id;
    private UUID employeeId;
    private LeaveType leaveType;
    private LocalDate startDate;
    private LocalDate endDate;
    private LeaveStatus status;
    private UUID approvedBy;
    private OffsetDateTime approvedAt;
    private String notes;
    private Instant createdAt;
    private Instant updatedAt;
}
