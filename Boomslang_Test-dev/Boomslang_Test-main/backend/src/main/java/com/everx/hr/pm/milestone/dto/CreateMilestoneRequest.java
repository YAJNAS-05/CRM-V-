package com.everx.hr.pm.milestone.dto;

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
public class CreateMilestoneRequest {

    @NotNull(message = "Project ID is required")
    private UUID projectId;

    @NotBlank(message = "Milestone title is required")
    private String title;

    private String description;
    private String status;
    private LocalDate dueDate;
}
