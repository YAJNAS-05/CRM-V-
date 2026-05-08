package com.everx.pm.project.dto;

import com.everx.pm.project.ProjectCost;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectCostDto {

    private UUID id;
    private UUID projectId;
    private String costType;
    private BigDecimal amount;
    private String description;
    private LocalDate recordedDate;

    public static ProjectCostDto fromEntity(ProjectCost cost) {
        return ProjectCostDto.builder()
                .id(cost.getId())
                .projectId(cost.getProjectId())
                .costType(cost.getCostType())
                .amount(cost.getAmount())
                .description(cost.getDescription())
                .recordedDate(cost.getRecordedDate())
                .build();
    }
}
