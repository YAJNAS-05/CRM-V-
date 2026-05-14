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
public class TaskDTO {
    private UUID id;
    private UUID projectId;
    private String taskNumber;
    private UUID parentTaskId;
    private UUID epicId;
    private UUID sprintId;
    private UUID milestoneId;
    private String title;
    private String description;
    private String taskType;
    private String priority;
    private String status;
    private Integer statusOrder;
    private LocalDate startDate;
    private LocalDate dueDate;
    private LocalDateTime completedAt;
    private Integer timeEstimate;
    private Integer timeSpent;
    private UUID assigneeId;
    private String assigneeName;
    private Integer storyPoints;
    private Boolean isRecurring;
    private String recurringPattern;
    private String coverImage;
    private Boolean isPrivate;
    private String metadata;
    private List<String> tags;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UUID createdBy;
}
