package com.everx.hr.okr.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KeyResultDto {

    private UUID id;
    private UUID objectiveId;
    private String title;
    private String description;
    private BigDecimal targetValue;
    private BigDecimal currentValue;
    private String unit;
    private String status;
    private Integer progressPercent;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer confidenceLevel;
    private Integer weight;
    private String createdAt;
    private String updatedAt;
}
