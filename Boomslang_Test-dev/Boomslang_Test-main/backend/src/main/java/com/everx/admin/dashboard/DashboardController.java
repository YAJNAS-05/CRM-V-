package com.everx.admin.dashboard;

import com.everx.admin.dashboard.dto.DashboardResponse;
import com.everx.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/analytics")
    @PreAuthorize("hasAnyRole('ADMIN', 'SALES_MANAGER', 'FINANCE')")
    public ResponseEntity<ApiResponse<DashboardResponse>> getGlobalAnalytics() {
        DashboardResponse stats = dashboardService.getGlobalAnalytics();
        return ResponseEntity.ok(ApiResponse.ok(stats, "Global analytics retrieved successfully"));
    }
}
