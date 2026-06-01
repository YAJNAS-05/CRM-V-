package com.everx.finance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApAgingMultiCurrencyDto {
    private String reportingCurrency;
    private LocalDate asOfDate;
    private BigDecimal current;
    private BigDecimal days30Plus;
    private BigDecimal days60Plus;
    private BigDecimal days90Plus;
    private BigDecimal total;
}
