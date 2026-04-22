package com.everx.shared.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinanceDashboardMetrics {
    private long totalInvoices;
    private long paidInvoices;
    private long pendingInvoices;
    private long overdueInvoices;
    private BigDecimal totalRevenue;
    private BigDecimal totalOutstanding;
    private int avgDaysToPayment;
    private double collectionRate;
    private List<AgingBucket> agingBuckets;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AgingBucket {
        private String label;
        private BigDecimal amount;
        private long count;
        private double percentage;
    }
}
