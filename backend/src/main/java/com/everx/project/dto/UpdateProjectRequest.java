package com.everx.project.dto;

import lombok.*;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProjectRequest {
    private String name;
    private String description;
    private String icon;
    private String color;
    private String category;
    private String projectType;
    private String visibility;
    private String status;
    private LocalDate startDate;
    private LocalDate endDate;
    private List<String> tags;
    private Boolean isArchived;
}
