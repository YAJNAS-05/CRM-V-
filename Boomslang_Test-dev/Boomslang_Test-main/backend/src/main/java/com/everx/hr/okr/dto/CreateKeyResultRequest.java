package com.everx.hr.okr.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateKeyResultRequest {

    @NotBlank
    private String title;

    private String description;

    @NotNull
    private BigDecimal targetValue;

    private String unit; // PERCENTAGE, NUMBER, CURRENCY, BOOLEAN

    private LocalDate startDate;

    private LocalDate endDate;

    private Integer confidenceLevel;

    private Integer weight;
}
