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
public class CreateTaskRequest {
    private UUID projectId;
    private String title;
    private String description;
    private String taskType;
    private String priority;
    private String status;
    private UUID assigneeId;
    private UUID epicId;
    private UUID sprintId;
    private UUID milestoneId;
    private UUID parentTaskId;
    private LocalDate startDate;
    private LocalDate dueDate;
    private Integer timeEstimate;
    private Integer storyPoints;
    private List<String> tags;
    private Boolean isPrivate;
}
