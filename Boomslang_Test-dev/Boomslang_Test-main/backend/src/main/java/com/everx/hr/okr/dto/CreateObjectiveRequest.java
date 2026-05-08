package com.everx.hr.okr.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class CreateObjectiveRequest {

    @NotNull
    private UUID employeeId;

    @NotNull
    private UUID cycleId;

    @NotBlank
    private String title;

    private String description;

    private String category; // PROFESSIONAL, PERSONAL, TEAM, COMPANY

    private Integer weight;

    private UUID alignmentParentId;

    private LocalDate startDate;

    private LocalDate endDate;

    private Boolean isPrivate;

    private List<CreateKeyResultRequest> keyResults;
}
