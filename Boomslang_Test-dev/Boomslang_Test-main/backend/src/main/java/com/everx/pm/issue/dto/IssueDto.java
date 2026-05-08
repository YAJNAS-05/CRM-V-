package com.everx.pm.issue.dto;

import com.everx.pm.issue.ProjectIssue;
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
public class IssueDto {

    private UUID id;
    private UUID projectId;
    private String title;
    private String description;
    private String priority;
    private String status;
    private UUID assigneeId;
    private LocalDate dueDate;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public static IssueDto fromEntity(ProjectIssue issue) {
        return IssueDto.builder()
                .id(issue.getId())
                .projectId(issue.getProjectId())
                .title(issue.getTitle())
                .description(issue.getDescription())
                .priority(issue.getPriority())
                .status(issue.getStatus())
                .assigneeId(issue.getAssigneeId())
                .dueDate(issue.getDueDate())
                .createdAt(issue.getCreatedAt())
                .updatedAt(issue.getUpdatedAt())
                .build();
    }
}
