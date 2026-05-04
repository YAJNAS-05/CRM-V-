package com.everx.hr.project.dto;

import com.everx.hr.task.dto.TaskDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectDetailDto {

    private ProjectDto project;
    private List<ProjectMemberDto> members;
    private List<TaskDto> tasks;
    private List<ProjectCostDto> costs;
    private BigDecimal totalLaborHours;
    private BigDecimal actualCost;
    private BigDecimal profitability;
    private Integer profitMargin;
}
