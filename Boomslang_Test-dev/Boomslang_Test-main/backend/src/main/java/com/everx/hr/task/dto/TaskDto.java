package com.everx.hr.task.dto;

import com.everx.hr.task.Task;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskDto {

    private UUID id;
    private UUID projectId;
    private String taskTitle;
    private String description;
    private UUID creatorId;
    private UUID assigneeId;
    private String status;
    private String priority;
    private BigDecimal estimatedHours;
    private LocalDate dueDate;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public static TaskDto fromEntity(Task task) {
        return TaskDto.builder()
                .id(task.getId())
                .projectId(task.getProjectId())
                .taskTitle(task.getTaskTitle())
                .description(task.getDescription())
                .creatorId(task.getCreatorId())
                .assigneeId(task.getAssigneeId())
                .status(task.getStatus())
                .priority(task.getPriority())
                .estimatedHours(task.getEstimatedHours())
                .dueDate(task.getDueDate())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}
