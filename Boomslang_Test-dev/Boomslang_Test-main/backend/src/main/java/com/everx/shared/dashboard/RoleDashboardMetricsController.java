package com.everx.shared.dashboard;

import com.everx.shared.dashboard.dto.FinanceDashboardMetrics;
import com.everx.shared.dashboard.dto.HRDashboardMetrics;
import com.everx.shared.dashboard.dto.OperationsDashboardMetrics;
import com.everx.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboards")
@RequiredArgsConstructor
public class RoleDashboardMetricsController {

    private final RoleDashboardMetricsService dashboardService;

    @GetMapping("/finance/metrics")
    public ResponseEntity<ApiResponse<FinanceDashboardMetrics>> getFinanceMetrics() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getFinanceMetrics(), "Finance metrics retrieved"));
    }

    @GetMapping("/hr/metrics")
    public ResponseEntity<ApiResponse<HRDashboardMetrics>> getHRMetrics() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getHRMetrics(), "HR metrics retrieved"));
    }

    @GetMapping("/operations/metrics")
    public ResponseEntity<ApiResponse<OperationsDashboardMetrics>> getOperationsMetrics() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getOperationsMetrics(), "Operations metrics retrieved"));
    }
}
