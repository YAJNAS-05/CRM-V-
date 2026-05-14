package com.everx.project.dto;

import lombok.*;
import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateEpicRequest {
    private String name;
    private String description;
    private String color;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private Integer progress;
    private UUID milestoneId;
}
