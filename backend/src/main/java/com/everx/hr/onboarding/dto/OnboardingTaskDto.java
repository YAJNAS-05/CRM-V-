package com.everx.hr.onboarding.dto;

import com.everx.hr.onboarding.OnboardingTask;
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
public class OnboardingTaskDto {

    private UUID id;
    private UUID employeeId;
    private String title;
    private String description;
    private String category;
    private LocalDate dueDate;
    private String status;
    private String assignedTo;
    private LocalDate completedAt;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public static OnboardingTaskDto fromEntity(OnboardingTask task) {
        return OnboardingTaskDto.builder()
                .id(task.getId())
                .employeeId(task.getEmployeeId())
                .title(task.getTitle())
                .description(task.getDescription())
                .category(task.getCategory())
                .dueDate(task.getDueDate())
                .status(task.getStatus())
                .assignedTo(task.getAssignedTo())
                .completedAt(task.getCompletedAt())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}
