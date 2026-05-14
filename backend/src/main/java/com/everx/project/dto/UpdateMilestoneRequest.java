package com.everx.project.dto;

import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateMilestoneRequest {
    private String name;
    private String description;
    private LocalDate dueDate;
    private String status;
    private Integer progress;
}
