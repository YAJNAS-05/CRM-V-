package com.everx.hr.okr.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ObjectiveDto {

    private UUID id;
    private UUID employeeId;
    private String employeeName;
    private UUID cycleId;
    private String cycleName;
    private String title;
    private String description;
    private String category;
    private String status;
    private Integer progressPercent;
    private Integer weight;
    private UUID alignmentParentId;
    private String alignmentParentTitle;
    private LocalDate startDate;
    private LocalDate endDate;
    private List<KeyResultDto> keyResults;
    private UUID managerId;
    private String managerName;
    private Boolean isPrivate;
    private String createdAt;
    private String updatedAt;
}
