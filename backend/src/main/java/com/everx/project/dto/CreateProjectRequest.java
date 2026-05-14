package com.everx.project.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateProjectRequest {
    private String name;
    private String description;
    private String icon;
    private String color;
    private String category;
    private String projectType;
    private String visibility;
    private UUID workspaceId;
    private UUID portfolioId;
    private LocalDate startDate;
    private LocalDate endDate;
    private List<String> tags;
}
