package com.everx.project.dto;

import lombok.*;
import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateEpicRequest {
    private UUID projectId;
    private String name;
    private String description;
    private String color;
    private LocalDate startDate;
    private LocalDate endDate;
    private UUID milestoneId;
}
