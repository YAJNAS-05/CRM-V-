package com.everx.hr.position.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PositionDto {
    private UUID id;
    private String title;
    private String grade;
    private BigDecimal minSalary;
    private BigDecimal maxSalary;
    private String currency;
    private Instant createdAt;
    private Instant updatedAt;
}
