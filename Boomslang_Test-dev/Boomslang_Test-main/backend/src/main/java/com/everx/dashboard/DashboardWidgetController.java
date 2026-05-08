package com.everx.dashboard;

import com.everx.dashboard.dto.*;
import com.everx.shared.dto.ApiResponse;
import com.everx.shared.util.SecurityUserContext;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class DashboardWidgetController {

    private final DashboardWidgetService dashboardService;

    @GetMapping("/widgets/templates")
    public ResponseEntity<ApiResponse<List<WidgetTemplateDto>>> getAllWidgetTemplates() {
        List<WidgetTemplateDto> templates = dashboardService.getAllWidgetTemplates();
        return ResponseEntity.ok(ApiResponse.ok(templates));
    }

    @GetMapping("/widgets/available")
    public ResponseEntity<ApiResponse<List<WidgetTemplateDto>>> getAvailableWidgets(@RequestParam String role) {
        List<WidgetTemplateDto> widgets = dashboardService.getAvailableWidgets(role);
        return ResponseEntity.ok(ApiResponse.ok(widgets));
    }

    @GetMapping("/layout/{dashboardType}")
    public ResponseEntity<ApiResponse<UserDashboardLayoutDto>> getUserLayout(@PathVariable String dashboardType) {
        UUID userId = SecurityUserContext.getCurrentUserIdOrNull();
        UserDashboardLayoutDto layout = dashboardService.getUserLayout(userId, dashboardType);
        return ResponseEntity.ok(ApiResponse.ok(layout));
    }

    @PostMapping("/layout/save")
    public ResponseEntity<ApiResponse<UserDashboardLayoutDto>> saveUserLayout(
            @Valid @RequestBody SaveDashboardLayoutRequest request) {
        UUID userId = SecurityUserContext.getCurrentUserIdOrNull();
        UserDashboardLayoutDto saved = dashboardService.saveUserLayout(userId, request);
        return ResponseEntity.ok(ApiResponse.ok(saved, "Layout saved successfully"));
    }

    @GetMapping("/widgets/{dashboardType}")
    public ResponseEntity<ApiResponse<List<DashboardWidgetDto>>> getUserWidgets(@PathVariable String dashboardType) {
        UUID userId = SecurityUserContext.getCurrentUserIdOrNull();
        List<DashboardWidgetDto> widgets = dashboardService.getUserWidgets(userId, dashboardType);
        return ResponseEntity.ok(ApiResponse.ok(widgets));
    }

    @PostMapping("/widgets")
    @PreAuthorize("hasAnyAuthority('DASHBOARD_EDIT', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<DashboardWidgetDto>> createWidget(
            @Valid @RequestBody CreateWidgetInstanceRequest request) {
        UUID userId = SecurityUserContext.getCurrentUserIdOrNull();
        request.setUserId(userId);
        DashboardWidgetDto created = dashboardService.createWidgetInstance(request);
        return ResponseEntity.ok(ApiResponse.ok(created, "Widget created successfully"));
    }

    @PutMapping("/widgets/{widgetId}")
    @PreAuthorize("hasAnyAuthority('DASHBOARD_EDIT', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<DashboardWidgetDto>> updateWidget(
            @PathVariable UUID widgetId,
            @Valid @RequestBody UpdateWidgetRequest request) {
        DashboardWidgetDto updated = dashboardService.updateWidgetInstance(widgetId, request);
        return ResponseEntity.ok(ApiResponse.ok(updated, "Widget updated successfully"));
    }

    @DeleteMapping("/widgets/{widgetId}")
    @PreAuthorize("hasAnyAuthority('DASHBOARD_EDIT', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteWidget(@PathVariable UUID widgetId) {
        dashboardService.deleteWidgetInstance(widgetId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Widget deleted successfully"));
    }
}
