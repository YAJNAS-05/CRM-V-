package com.everx.hr.okr.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OkrCycleDto {

    private UUID id;
    private String name;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private Boolean isDefault;
    private String checkInFrequency;
    private Integer companyObjectivesCount;
    private Integer teamObjectivesCount;
    private Integer individualObjectivesCount;
    private Integer maxKeyResultsPerObjective;
    private String createdAt;
    private String updatedAt;
}
