package com.everx.hr.okr.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateKeyResultProgressRequest {

    @NotNull
    private BigDecimal currentValue;

    private Integer confidenceLevel; // 1-10

    private String notes;
}
