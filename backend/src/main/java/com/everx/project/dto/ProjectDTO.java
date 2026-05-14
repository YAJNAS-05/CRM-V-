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
public class ProjectDTO {
    private UUID id;
    private UUID workspaceId;
    private UUID portfolioId;
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
    private UUID ownerId;
    private String settings;
    private String metadata;
    private List<String> tags;
    private Boolean isArchived;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UUID createdBy;
}
