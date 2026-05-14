package com.everx.finance.report.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CashFlowResponse {
    private BigDecimal totalInflow;
    private BigDecimal totalOutflow; // Based on Purchase Orders / Payments to suppliers
    private BigDecimal netCashFlow;
    private List<CashFlowEntry> entries;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CashFlowEntry {
        private LocalDate date;
        private BigDecimal inflow;
        private BigDecimal outflow;
        private BigDecimal balance;
    }
}
