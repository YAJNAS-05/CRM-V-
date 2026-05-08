package com.everx.finance.consolidation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EntityBalanceDto {
    private String entityCode;
    private BigDecimal totalAssets;
    private BigDecimal totalLiabilities;
    private BigDecimal totalEquity;

    public EntityBalanceDto(String entityCode, BigDecimal totalAssets, BigDecimal totalLiabilities, BigDecimal totalEquity) {
        this.entityCode = entityCode;
        this.totalAssets = totalAssets != null ? totalAssets : BigDecimal.ZERO;
        this.totalLiabilities = totalLiabilities != null ? totalLiabilities : BigDecimal.ZERO;
        this.totalEquity = totalEquity != null ? totalEquity : BigDecimal.ZERO;
    }
}
