package com.everx.hr.pm.risk.dto;

import com.everx.hr.pm.risk.ProjectRisk;
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
public class RiskDto {

    private UUID id;
    private UUID projectId;
    private String title;
    private String description;
    private String severity;
    private String status;
    private UUID ownerId;
    private String mitigationPlan;
    private LocalDate dueDate;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public static RiskDto fromEntity(ProjectRisk risk) {
        return RiskDto.builder()
                .id(risk.getId())
                .projectId(risk.getProjectId())
                .title(risk.getTitle())
                .description(risk.getDescription())
                .severity(risk.getSeverity())
                .status(risk.getStatus())
                .ownerId(risk.getOwnerId())
                .mitigationPlan(risk.getMitigationPlan())
                .dueDate(risk.getDueDate())
                .createdAt(risk.getCreatedAt())
                .updatedAt(risk.getUpdatedAt())
                .build();
    }
}
