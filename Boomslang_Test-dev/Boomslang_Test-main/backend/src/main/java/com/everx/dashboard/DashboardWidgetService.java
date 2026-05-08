package com.everx.dashboard;

import com.everx.dashboard.dto.*;
import com.everx.shared.exception.EntityNotFoundException;
import com.everx.shared.util.SecurityUserContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class DashboardWidgetService {

    private final DashboardWidgetRepository widgetRepository;
    private final UserDashboardLayoutRepository layoutRepository;

    // Pre-built widget templates by role
    private static final List<WidgetTemplateDto> DEFAULT_WIDGETS = List.of(
        // Sales Widgets
        WidgetTemplateDto.builder()
            .widgetType("CRM_PIPELINE_VALUE")
            .title("Pipeline Value")
            .description("Total weighted pipeline value")
            .dataSource("/api/v1/crm/reports/dashboard")
            .refreshInterval(300)
            .defaultWidth(2)
            .defaultHeight(1)
            .supportedRoles(List.of("SALES", "SALES_MANAGER", "ADMIN"))
            .build(),
        
        WidgetTemplateDto.builder()
            .widgetType("CRM_LEADS_TODAY")
            .title("New Leads Today")
            .description("Count of new leads created today")
            .dataSource("/api/v1/crm/leads/count/today")
            .refreshInterval(60)
            .defaultWidth(1)
            .defaultHeight(1)
            .supportedRoles(List.of("SALES", "SALES_MANAGER", "ADMIN"))
            .build(),
        
        WidgetTemplateDto.builder()
            .widgetType("CRM_DEALS_CLOSED")
            .title("Deals Closed This Month")
            .description("Count and value of won deals")
            .dataSource("/api/v1/crm/reports/dashboard")
            .refreshInterval(300)
            .defaultWidth(2)
            .defaultHeight(1)
            .supportedRoles(List.of("SALES", "SALES_MANAGER", "ADMIN"))
            .build(),
        
        // Finance Widgets
        WidgetTemplateDto.builder()
            .widgetType("FINANCE_AR_AGING")
            .title("AR Aging Summary")
            .description("Accounts receivable aging buckets")
            .dataSource("/api/v1/finance/aging/ar-report")
            .refreshInterval(600)
            .defaultWidth(2)
            .defaultHeight(2)
            .supportedRoles(List.of("FINANCE", "FINANCE_MANAGER", "ADMIN"))
            .build(),
        
        WidgetTemplateDto.builder()
            .widgetType("FINANCE_CASH_FLOW")
            .title("Cash Flow")
            .description("Monthly cash inflow/outflow")
            .dataSource("/api/v1/finance/reports/cash-flow")
            .refreshInterval(600)
            .defaultWidth(3)
            .defaultHeight(2)
            .supportedRoles(List.of("FINANCE", "FINANCE_MANAGER", "CFO", "ADMIN"))
            .build(),
        
        // HR Widgets
        WidgetTemplateDto.builder()
            .widgetType("HR_HEADCOUNT")
            .title("Employee Headcount")
            .description("Active employees by department")
            .dataSource("/api/v1/hr/dashboard/metrics")
            .refreshInterval(600)
            .defaultWidth(2)
            .defaultHeight(1)
            .supportedRoles(List.of("HR", "HR_MANAGER", "ADMIN"))
            .build(),
        
        WidgetTemplateDto.builder()
            .widgetType("HR_OKR_PROGRESS")
            .title("OKR Progress")
            .description("Average objective completion rate")
            .dataSource("/api/v1/hr/okr/dashboard")
            .refreshInterval(300)
            .defaultWidth(2)
            .defaultHeight(1)
            .supportedRoles(List.of("HR", "MANAGER", "ADMIN"))
            .build(),
        
        // Operations Widgets
        WidgetTemplateDto.builder()
            .widgetType("FIELD_ACTIVE_JOBS")
            .title("Active Field Jobs")
            .description("Currently active field service jobs")
            .dataSource("/api/v1/field-work/jobs/active/count")
            .refreshInterval(60)
            .defaultWidth(1)
            .defaultHeight(1)
            .supportedRoles(List.of("OPERATIONS", "FIELD_MANAGER", "ADMIN"))
            .build(),
        
        WidgetTemplateDto.builder()
            .widgetType("FIELD_GPS_TRACKING")
            .title("Live GPS Tracking")
            .description("Real-time engineer locations on map")
            .dataSource("/api/v1/field-work/gps/engineers/active")
            .refreshInterval(30)
            .defaultWidth(3)
            .defaultHeight(2)
            .supportedRoles(List.of("OPERATIONS", "FIELD_MANAGER", "ADMIN"))
            .build(),
        
        // ERP Widgets
        WidgetTemplateDto.builder()
            .widgetType("ERP_INVENTORY_STATUS")
            .title("Inventory Status")
            .description("Stock levels and low stock alerts")
            .dataSource("/api/v1/erp/inventory/dashboard")
            .refreshInterval(300)
            .defaultWidth(2)
            .defaultHeight(2)
            .supportedRoles(List.of("OPERATIONS", "INVENTORY_MANAGER", "ADMIN"))
            .build(),
        
        WidgetTemplateDto.builder()
            .widgetType("ERP_WARRANTY_CLAIMS")
            .title("Warranty Claims")
            .description("Pending and recent warranty claims")
            .dataSource("/api/v1/erp/warranty/dashboard")
            .refreshInterval(300)
            .defaultWidth(2)
            .defaultHeight(1)
            .supportedRoles(List.of("OPERATIONS", "SERVICE_MANAGER", "ADMIN"))
            .build(),
        
        // System/Admin Widgets
        WidgetTemplateDto.builder()
            .widgetType("SYSTEM_HEALTH")
            .title("System Health")
            .description("API status, DB connections, queue depth")
            .dataSource("/api/v1/system/health")
            .refreshInterval(30)
            .defaultWidth(2)
            .defaultHeight(1)
            .supportedRoles(List.of("ADMIN", "SUPER_ADMIN", "DEVOPS"))
            .build(),
        
        WidgetTemplateDto.builder()
            .widgetType("AUDIT_LOG_SUMMARY")
            .title("Audit Activity")
            .description("Recent system activity and changes")
            .dataSource("/api/v1/security/audit/summary")
            .refreshInterval(300)
            .defaultWidth(2)
            .defaultHeight(1)
            .supportedRoles(List.of("ADMIN", "SUPER_ADMIN", "AUDIT"))
            .build()
    );

    @Transactional(readOnly = true)
    public List<WidgetTemplateDto> getAvailableWidgets(String role) {
        return DEFAULT_WIDGETS.stream()
            .filter(w -> w.getSupportedRoles().contains(role))
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WidgetTemplateDto> getAllWidgetTemplates() {
        return DEFAULT_WIDGETS;
    }

    @Transactional(readOnly = true)
    public UserDashboardLayoutDto getUserLayout(UUID userId, String dashboardType) {
        UserDashboardLayout layout = layoutRepository
            .findByUserIdAndDashboardType(userId, dashboardType)
            .orElse(null);

        if (layout == null) {
            // Return default layout for role
            return getDefaultLayout(dashboardType);
        }

        return toLayoutDto(layout);
    }

    public UserDashboardLayoutDto saveUserLayout(UUID userId, SaveDashboardLayoutRequest request) {
        UserDashboardLayout layout = layoutRepository
            .findByUserIdAndDashboardType(userId, request.getDashboardType())
            .orElse(new UserDashboardLayout());

        layout.setUserId(userId);
        layout.setDashboardType(request.getDashboardType());
        layout.setLayoutJson(request.getLayoutJson());
        layout.setUpdatedAt(java.time.Instant.now());

        UserDashboardLayout saved = layoutRepository.save(layout);
        return toLayoutDto(saved);
    }

    public DashboardWidgetDto createWidgetInstance(CreateWidgetInstanceRequest request) {
        DashboardWidget widget = new DashboardWidget();
        widget.setUserId(request.getUserId());
        widget.setWidgetType(request.getWidgetType());
        widget.setTitle(request.getTitle());
        widget.setPositionX(request.getPositionX());
        widget.setPositionY(request.getPositionY());
        widget.setWidth(request.getWidth());
        widget.setHeight(request.getHeight());
        widget.setConfigJson(request.getConfigJson());
        widget.setDashboardType(request.getDashboardType());

        DashboardWidget saved = widgetRepository.save(widget);
        return toWidgetDto(saved);
    }

    public DashboardWidgetDto updateWidgetInstance(UUID widgetId, UpdateWidgetRequest request) {
        DashboardWidget widget = widgetRepository.findById(widgetId)
            .orElseThrow(() -> new EntityNotFoundException("Widget not found: " + widgetId));

        if (request.getPositionX() != null) widget.setPositionX(request.getPositionX());
        if (request.getPositionY() != null) widget.setPositionY(request.getPositionY());
        if (request.getWidth() != null) widget.setWidth(request.getWidth());
        if (request.getHeight() != null) widget.setHeight(request.getHeight());
        if (request.getConfigJson() != null) widget.setConfigJson(request.getConfigJson());

        DashboardWidget saved = widgetRepository.save(widget);
        return toWidgetDto(saved);
    }

    public void deleteWidgetInstance(UUID widgetId) {
        widgetRepository.deleteById(widgetId);
    }

    @Transactional(readOnly = true)
    public List<DashboardWidgetDto> getUserWidgets(UUID userId, String dashboardType) {
        return widgetRepository.findByUserIdAndDashboardType(userId, dashboardType)
            .stream()
            .map(this::toWidgetDto)
            .collect(Collectors.toList());
    }

    // ==================== Helper Methods ====================

    private UserDashboardLayoutDto getDefaultLayout(String dashboardType) {
        // Return default layout based on dashboard type
        String role = detectRoleFromDashboardType(dashboardType);
        
        List<WidgetTemplateDto> availableWidgets = getAvailableWidgets(role);
        
        // Create default positioned widgets
        int x = 0, y = 0;
        List<WidgetPositionDto> positions = availableWidgets.stream()
            .limit(6) // Limit to first 6 widgets
            .map(w -> {
                WidgetPositionDto pos = WidgetPositionDto.builder()
                    .widgetType(w.getWidgetType())
                    .title(w.getTitle())
                    .x(x)
                    .y(y)
                    .width(w.getDefaultWidth())
                    .height(w.getDefaultHeight())
                    .build();
                return pos;
            })
            .collect(Collectors.toList());

        return UserDashboardLayoutDto.builder()
            .dashboardType(dashboardType)
            .widgets(positions)
            .isDefault(true)
            .build();
    }

    private String detectRoleFromDashboardType(String dashboardType) {
        return switch (dashboardType.toUpperCase()) {
            case "SALES" -> "SALES_MANAGER";
            case "FINANCE" -> "FINANCE_MANAGER";
            case "HR" -> "HR_MANAGER";
            case "OPERATIONS" -> "FIELD_MANAGER";
            case "ADMIN" -> "ADMIN";
            default -> "USER";
        };
    }

    private UserDashboardLayoutDto toLayoutDto(UserDashboardLayout layout) {
        return UserDashboardLayoutDto.builder()
            .id(layout.getId())
            .userId(layout.getUserId())
            .dashboardType(layout.getDashboardType())
            .layoutJson(layout.getLayoutJson())
            .updatedAt(layout.getUpdatedAt())
            .isDefault(false)
            .build();
    }

    private DashboardWidgetDto toWidgetDto(DashboardWidget widget) {
        return DashboardWidgetDto.builder()
            .id(widget.getId())
            .widgetType(widget.getWidgetType())
            .title(widget.getTitle())
            .positionX(widget.getPositionX())
            .positionY(widget.getPositionY())
            .width(widget.getWidth())
            .height(widget.getHeight())
            .configJson(widget.getConfigJson())
            .dashboardType(widget.getDashboardType())
            .createdAt(widget.getCreatedAt())
            .build();
    }
}
