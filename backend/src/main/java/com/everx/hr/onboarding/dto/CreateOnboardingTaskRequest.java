package com.everx.hr.onboarding.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateOnboardingTaskRequest {

    @NotNull(message = "Employee ID is required")
    private UUID employeeId;

    @NotBlank(message = "Task title is required")
    private String title;

    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    private LocalDate dueDate;
    private String status;
    private String assignedTo;
    private LocalDate completedAt;
}
