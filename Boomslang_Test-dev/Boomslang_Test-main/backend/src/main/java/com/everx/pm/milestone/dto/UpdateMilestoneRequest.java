package com.everx.pm.milestone.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateMilestoneRequest {

    private String title;
    private String description;
    private String status;
    private LocalDate dueDate;
    private OffsetDateTime completedAt;
}
