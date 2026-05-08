package com.everx.pm.milestone.dto;

import com.everx.pm.milestone.ProjectMilestone;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MilestoneDto {

    private UUID id;
    private UUID projectId;
    private String title;
    private String description;
    private String status;
    private LocalDate dueDate;
    private OffsetDateTime completedAt;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public static MilestoneDto fromEntity(ProjectMilestone milestone) {
        return MilestoneDto.builder()
                .id(milestone.getId())
                .projectId(milestone.getProjectId())
                .title(milestone.getTitle())
                .description(milestone.getDescription())
                .status(milestone.getStatus())
                .dueDate(milestone.getDueDate())
                .completedAt(milestone.getCompletedAt())
                .createdAt(milestone.getCreatedAt())
                .updatedAt(milestone.getUpdatedAt())
                .build();
    }
}
