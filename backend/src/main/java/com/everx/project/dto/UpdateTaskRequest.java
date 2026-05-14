package com.everx.project.dto;

import lombok.*;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateTaskRequest {
    private String title;
    private String description;
    private String taskType;
    private String priority;
    private String status;
    private Integer statusOrder;
    private UUID assigneeId;
    private UUID epicId;
    private UUID sprintId;
    private UUID milestoneId;
    private LocalDate startDate;
    private LocalDate dueDate;
    private Integer timeEstimate;
    private Integer timeSpent;
    private Integer storyPoints;
    private Boolean isRecurring;
    private String recurringPattern;
    private String coverImage;
    private Boolean isPrivate;
    private List<String> tags;
}
