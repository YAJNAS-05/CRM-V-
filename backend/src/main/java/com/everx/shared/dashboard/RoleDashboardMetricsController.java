package com.everx.shared.dashboard;

import com.everx.shared.dashboard.dto.FinanceDashboardMetrics;
import com.everx.shared.dashboard.dto.HRDashboardMetrics;
import com.everx.shared.dashboard.dto.OperationsDashboardMetrics;
import com.everx.shared.dashboard.dto.ComposedDashboardMetrics;
import com.everx.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/dashboards")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class RoleDashboardMetricsController {

    private final RoleDashboardMetricsService dashboardService;

    @GetMapping("/finance/metrics")
    public ResponseEntity<ApiResponse<FinanceDashboardMetrics>> getFinanceMetrics() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getFinanceMetrics(), "Finance metrics retrieved"));
    }

    @GetMapping("/compose")
    public ResponseEntity<ApiResponse<ComposedDashboardMetrics>> composeDashboard(
            @RequestParam(required = false) List<String> roles,
            Authentication authentication
    ) {
        List<String> authorityNames = authentication.getAuthorities().stream()
                .map(grantedAuthority -> grantedAuthority.getAuthority())
                .collect(Collectors.toList());

        List<String> effectiveRoles = roles != null && !roles.isEmpty()
                ? roles
                : authorityNames.stream()
                    .filter(name -> name.startsWith("ROLE_"))
                    .map(name -> name.substring(5))
                    .collect(Collectors.toList());

        List<String> permissions = authorityNames.stream()
                .filter(name -> !name.startsWith("ROLE_"))
                .collect(Collectors.toList());

        ComposedDashboardMetrics composed = dashboardService.composeDashboard(effectiveRoles, permissions);
        return ResponseEntity.ok(ApiResponse.ok(composed, "Composed dashboard fetched"));
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
