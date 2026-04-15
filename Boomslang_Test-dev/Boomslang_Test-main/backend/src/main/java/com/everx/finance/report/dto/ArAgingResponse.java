package com.everx.finance.report.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArAgingResponse {
    private BigDecimal totalOutstanding;
    private int totalOverdueCount;
    private Map<String, BigDecimal> agingBuckets; // "0-30", "31-60", "61-90", "90+"
    private Map<String, Integer> countBuckets;
}
