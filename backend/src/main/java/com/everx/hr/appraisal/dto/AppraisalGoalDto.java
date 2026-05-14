package com.everx.hr.appraisal.dto;

import com.everx.hr.appraisal.AppraisalGoal;
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
public class AppraisalGoalDto {

    private UUID id;
    private UUID ownerId;
    private String ownerName;
    private String title;
    private String description;
    private LocalDate targetDate;
    private String status;
    private Integer progress;
    private String parentGoalId;
    private String parentGoalTitle;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public static AppraisalGoalDto fromEntity(AppraisalGoal goal) {
        return AppraisalGoalDto.builder()
                .id(goal.getId())
                .ownerId(goal.getOwnerId())
                .ownerName(goal.getOwnerName())
                .title(goal.getTitle())
                .description(goal.getDescription())
                .targetDate(goal.getTargetDate())
                .status(goal.getStatus())
                .progress(goal.getProgress())
                .parentGoalId(goal.getParentGoalId())
                .parentGoalTitle(goal.getParentGoalTitle())
                .createdAt(goal.getCreatedAt())
                .updatedAt(goal.getUpdatedAt())
                .build();
    }
}
