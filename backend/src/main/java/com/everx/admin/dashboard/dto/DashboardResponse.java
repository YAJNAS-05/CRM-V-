package com.everx.admin.dashboard.dto;

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
public class DashboardResponse {
    private CRMStats crm;
    private ERPStats erp;
    private FinanceStats finance;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CRMStats {
        private long totalDeals;
        private BigDecimal totalPipelineValue;
        private Map<String, Long> dealsByStage;
        private Map<String, BigDecimal> valueByStage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ERPStats {
        private long totalEquipment;
        private Map<String, Long> equipmentByStatus;
        private long openFieldJobs;
        private Map<String, Long> jobsByPriority;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FinanceStats {
        private BigDecimal monthlyRevenue;
        private long overdueInvoicesCount;
        private BigDecimal totalOverdueAmount;
        private Map<String, BigDecimal> revenueByEntity;
    }
}
