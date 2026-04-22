package com.everx.hr.position.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePositionRequest {
    private String title;
    private String grade;
    private BigDecimal minSalary;
    private BigDecimal maxSalary;
    private String currency;
}
