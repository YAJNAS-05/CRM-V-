package com.everx.hr.onboarding.dto;

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
public class UpdateOnboardingTaskRequest {

    private UUID employeeId;
    private String title;
    private String description;
    private String category;
    private LocalDate dueDate;
    private String status;
    private String assignedTo;
    private LocalDate completedAt;
}
