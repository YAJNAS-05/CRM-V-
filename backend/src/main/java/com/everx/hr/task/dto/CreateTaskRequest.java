package com.everx.hr.task.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class CreateTaskRequest {

    @NotNull(message = "Project ID is required")
    private UUID projectId;

    @NotBlank(message = "Task title is required")
    private String taskTitle;

    private String description;
    private UUID creatorId;
    private UUID assigneeId;
    private String status;
    private String priority;
    private BigDecimal estimatedHours;
    private LocalDate dueDate;
}
