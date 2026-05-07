package com.everx.hr.pm.issue.dto;

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
public class UpdateIssueRequest {

    private String title;
    private String description;
    private String priority;
    private String status;
    private UUID assigneeId;
    private LocalDate dueDate;
}
