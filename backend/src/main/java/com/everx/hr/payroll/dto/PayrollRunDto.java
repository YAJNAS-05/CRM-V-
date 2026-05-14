package com.everx.hr.payroll.dto;

import com.everx.hr.PayrollRunStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PayrollRunDto {
    private UUID id;
    private LocalDate periodStart;
    private LocalDate periodEnd;
    private PayrollRunStatus status;
    private LocalDate runDate;
    private String notes;
    private List<PayrollItemDto> items;
    private Instant createdAt;
    private Instant updatedAt;
}
