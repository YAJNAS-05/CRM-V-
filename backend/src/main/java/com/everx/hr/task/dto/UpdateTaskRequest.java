package com.everx.hr.task.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateTaskRequest {

    private String taskTitle;
    private String description;
    private UUID assigneeId;
    private String status;
    private String priority;
    private BigDecimal estimatedHours;
    private LocalDate dueDate;
}
