package com.everx.reporting.controller;

import com.everx.shared.dto.ApiResponse;
import com.everx.reporting.dto.*;
import com.everx.reporting.service.ReportingDashboardService;
import com.everx.reporting.service.ReportingDashboardWidgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/v1/dashboards")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class ReportingDashboardController {

    private final ReportingDashboardService dashboardService;
    private final ReportingDashboardWidgetService dashboardWidgetService;

    // ==================== Dashboard Management ====================

    @GetMapping
    public ResponseEntity<ApiResponse<Page<DashboardConfigDTO>>> getUserDashboards(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserDetails user) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(ApiResponse.success(
            dashboardService.getUserDashboards(user.getUsername(), pageable)));
    }

    @GetMapping("/default")
    public ResponseEntity<ApiResponse<DashboardConfigDTO>> getDefaultDashboard(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.success(
            dashboardService.getDefaultDashboard(user.getUsername())));
    }

    @GetMapping("/{dashboardId}")
    public ResponseEntity<ApiResponse<DashboardConfigDTO>> getDashboard(
            @PathVariable Long dashboardId,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.success(
            dashboardService.getDashboard(dashboardId, user.getUsername())));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DashboardConfigDTO>> createDashboard(
            @RequestBody @Valid CreateDashboardRequest request,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
            dashboardService.createDashboard(user.getUsername(), request)));
    }

    @PutMapping("/{dashboardId}")
    public ResponseEntity<ApiResponse<DashboardConfigDTO>> updateDashboard(
            @PathVariable Long dashboardId,
            @RequestBody @Valid UpdateDashboardRequest request,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.success(
            dashboardService.updateDashboard(dashboardId, user.getUsername(), request)));
    }

    @DeleteMapping("/{dashboardId}")
    public ResponseEntity<?> deleteDashboard(
            @PathVariable Long dashboardId,
            @AuthenticationPrincipal UserDetails user) {
        dashboardService.deleteDashboard(dashboardId, user.getUsername());
        return ResponseEntity.ok(ApiResponse.ok(null, "Dashboard deleted successfully"));
    }

    // ==================== Widget Management ====================

    @GetMapping("/{dashboardId}/widgets")
    public ResponseEntity<ApiResponse<List<DashboardWidgetDTO>>> getWidgets(
            @PathVariable Long dashboardId,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.success(
            dashboardWidgetService.getWidgets(dashboardId, user.getUsername())));
    }

    @PostMapping("/{dashboardId}/widgets")
    public ResponseEntity<ApiResponse<DashboardWidgetDTO>> createWidget(
            @PathVariable Long dashboardId,
            @RequestBody @Valid CreateDashboardWidgetRequest request,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
            dashboardWidgetService.createWidget(dashboardId, request, user.getUsername())));
    }

    @PutMapping("/{dashboardId}/widgets/{widgetId}")
    public ResponseEntity<ApiResponse<DashboardWidgetDTO>> updateWidget(
            @PathVariable Long dashboardId,
            @PathVariable Long widgetId,
            @RequestBody @Valid UpdateDashboardWidgetRequest request,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.success(
            dashboardWidgetService.updateWidget(dashboardId, widgetId, request, user.getUsername())));
    }

    @DeleteMapping("/{dashboardId}/widgets/{widgetId}")
    public ResponseEntity<?> deleteWidget(
            @PathVariable Long dashboardId,
            @PathVariable Long widgetId,
            @AuthenticationPrincipal UserDetails user) {
        dashboardWidgetService.deleteWidget(dashboardId, widgetId, user.getUsername());
        return ResponseEntity.ok(ApiResponse.ok(null, "Widget deleted successfully"));
    }

    @PostMapping("/{dashboardId}/widgets/batch-update-positions")
    public ResponseEntity<?> updateWidgetPositions(
            @PathVariable Long dashboardId,
            @RequestBody BatchUpdateWidgetsRequest request,
            @AuthenticationPrincipal UserDetails user) {
        dashboardWidgetService.updateWidgetPositions(dashboardId, request, user.getUsername());
        return ResponseEntity.ok(ApiResponse.ok(null, "Widget positions updated successfully"));
    }
}
