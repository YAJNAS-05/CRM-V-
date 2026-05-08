package com.everx.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsResultDto {
    private String prediction;
    private BigDecimal confidence;
    private LocalDateTime generatedAt;
}
