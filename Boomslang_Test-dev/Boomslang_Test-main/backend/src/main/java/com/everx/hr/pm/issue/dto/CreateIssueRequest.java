package com.everx.hr.pm.issue.dto;

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
public class CreateIssueRequest {

    @NotNull(message = "Project ID is required")
    private UUID projectId;

    @NotBlank(message = "Issue title is required")
    private String title;

    private String description;
    private String priority;
    private String status;
    private UUID assigneeId;
    private LocalDate dueDate;
}
