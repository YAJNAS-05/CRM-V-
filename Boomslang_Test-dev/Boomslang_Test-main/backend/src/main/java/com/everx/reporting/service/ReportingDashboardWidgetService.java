package com.everx.reporting.service;

import com.everx.reporting.entity.DashboardConfigEntity;
import com.everx.reporting.entity.DashboardWidgetEntity;
import com.everx.reporting.repository.DashboardWidgetRepository;
import com.everx.reporting.repository.DashboardConfigRepository;
import com.everx.reporting.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ReportingDashboardWidgetService {

    private final DashboardWidgetRepository dashboardWidgetRepository;
    private final DashboardConfigRepository dashboardConfigRepository;

    public DashboardWidgetDTO createWidget(Long dashboardId, CreateDashboardWidgetRequest request, String userEmail) {
        DashboardConfigEntity dashboard = dashboardConfigRepository.findById(dashboardId)
            .orElseThrow(() -> new RuntimeException("Dashboard not found"));
        
        validateDashboardAccess(dashboard, userEmail);

        DashboardWidgetEntity widget = DashboardWidgetEntity.builder()
            .dashboardConfig(dashboard)
            .reportId(request.getReportId())
            .widgetType(request.getWidgetType())
            .widgetTitle(request.getWidgetTitle())
            .description(request.getDescription())
            .colIndex(request.getColIndex() != null ? request.getColIndex() : 0)
            .rowIndex(request.getRowIndex() != null ? request.getRowIndex() : 0)
            .colSpan(request.getColSpan() != null ? request.getColSpan() : 3)
            .rowSpan(request.getRowSpan() != null ? request.getRowSpan() : 2)
            .backgroundColor(request.getBackgroundColor())
            .fontSize(request.getFontSize())
            .config(request.getConfig())
            .chartType(request.getChartType())
            .metricField(request.getMetricField())
            .metricLabel(request.getMetricLabel())
            .metricFormat(request.getMetricFormat())
            .filtersApplied(request.getFiltersApplied())
            .sortConfig(request.getSortConfig())
            .refreshInterval(request.getRefreshInterval() != null ? request.getRefreshInterval() : 300)
            .isVisible(true)
            .isLocked(false)
            .isCached(false)
            .createdBy(userEmail)
            .widgetOrder((int) dashboardWidgetRepository.countWidgetsInDashboard(dashboardId))
            .build();

        DashboardWidgetEntity saved = dashboardWidgetRepository.save(widget);
        
        // Update widget count in dashboard
        dashboard.setWidgetsCount((int) dashboardWidgetRepository.countWidgetsInDashboard(dashboardId));
        dashboardConfigRepository.save(dashboard);

        return mapToDTO(saved);
    }

    public DashboardWidgetDTO updateWidget(Long dashboardId, Long widgetId, UpdateDashboardWidgetRequest request, String userEmail) {
        DashboardConfigEntity dashboard = dashboardConfigRepository.findById(dashboardId)
            .orElseThrow(() -> new RuntimeException("Dashboard not found"));
        
        validateDashboardAccess(dashboard, userEmail);

        DashboardWidgetEntity widget = dashboardWidgetRepository.findByWidgetIdAndDashboardConfigDashboardId(widgetId, dashboardId)
            .orElseThrow(() -> new RuntimeException("Widget not found"));

        if (request.getWidgetTitle() != null) widget.setWidgetTitle(request.getWidgetTitle());
        if (request.getDescription() != null) widget.setDescription(request.getDescription());
        if (request.getColIndex() != null) widget.setColIndex(request.getColIndex());
        if (request.getRowIndex() != null) widget.setRowIndex(request.getRowIndex());
        if (request.getColSpan() != null) widget.setColSpan(request.getColSpan());
        if (request.getRowSpan() != null) widget.setRowSpan(request.getRowSpan());
        if (request.getBackgroundColor() != null) widget.setBackgroundColor(request.getBackgroundColor());
        if (request.getFontSize() != null) widget.setFontSize(request.getFontSize());
        if (request.getConfig() != null) widget.setConfig(request.getConfig());
        if (request.getFiltersApplied() != null) widget.setFiltersApplied(request.getFiltersApplied());
        if (request.getSortConfig() != null) widget.setSortConfig(request.getSortConfig());
        if (request.getIsVisible() != null) widget.setIsVisible(request.getIsVisible());
        if (request.getIsLocked() != null) widget.setIsLocked(request.getIsLocked());
        if (request.getRefreshInterval() != null) widget.setRefreshInterval(request.getRefreshInterval());

        return mapToDTO(dashboardWidgetRepository.save(widget));
    }

    public void deleteWidget(Long dashboardId, Long widgetId, String userEmail) {
        DashboardConfigEntity dashboard = dashboardConfigRepository.findById(dashboardId)
            .orElseThrow(() -> new RuntimeException("Dashboard not found"));
        
        validateDashboardAccess(dashboard, userEmail);

        DashboardWidgetEntity widget = dashboardWidgetRepository.findByWidgetIdAndDashboardConfigDashboardId(widgetId, dashboardId)
            .orElseThrow(() -> new RuntimeException("Widget not found"));

        dashboardWidgetRepository.delete(widget);
        
        // Update widget count in dashboard
        dashboard.setWidgetsCount((int) dashboardWidgetRepository.countWidgetsInDashboard(dashboardId));
        dashboardConfigRepository.save(dashboard);
    }

    public List<DashboardWidgetDTO> getWidgets(Long dashboardId, String userEmail) {
        DashboardConfigEntity dashboard = dashboardConfigRepository.findById(dashboardId)
            .orElseThrow(() -> new RuntimeException("Dashboard not found"));
        
        validateDashboardAccess(dashboard, userEmail);

        return dashboardWidgetRepository.findByDashboardConfigDashboardIdOrderByWidgetOrder(dashboardId)
            .stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    public void updateWidgetPositions(Long dashboardId, BatchUpdateWidgetsRequest request, String userEmail) {
        DashboardConfigEntity dashboard = dashboardConfigRepository.findById(dashboardId)
            .orElseThrow(() -> new RuntimeException("Dashboard not found"));
        
        validateDashboardAccess(dashboard, userEmail);

        for (BatchUpdateWidgetsRequest.WidgetPositionUpdate update : request.getUpdates()) {
            DashboardWidgetEntity widget = dashboardWidgetRepository.findById(update.getWidgetId())
                .orElseThrow(() -> new RuntimeException("Widget not found: " + update.getWidgetId()));
            
            if (update.getColIndex() != null) widget.setColIndex(update.getColIndex());
            if (update.getRowIndex() != null) widget.setRowIndex(update.getRowIndex());
            if (update.getColSpan() != null) widget.setColSpan(update.getColSpan());
            if (update.getRowSpan() != null) widget.setRowSpan(update.getRowSpan());
            if (update.getWidgetOrder() != null) widget.setWidgetOrder(update.getWidgetOrder());
            
            dashboardWidgetRepository.save(widget);
        }
    }

    private void validateDashboardAccess(DashboardConfigEntity dashboard, String userEmail) {
        if (!dashboard.getUserEmail().equals(userEmail) && !dashboard.getIsShared()) {
            throw new RuntimeException("Unauthorized access to dashboard");
        }
    }

    private DashboardWidgetDTO mapToDTO(DashboardWidgetEntity widget) {
        return DashboardWidgetDTO.builder()
            .widgetId(widget.getWidgetId())
            .dashboardId(widget.getDashboardConfig().getDashboardId())
            .reportId(widget.getReportId())
            .widgetType(widget.getWidgetType())
            .widgetTitle(widget.getWidgetTitle())
            .widgetKey(widget.getWidgetKey())
            .description(widget.getDescription())
            .colIndex(widget.getColIndex())
            .rowIndex(widget.getRowIndex())
            .colSpan(widget.getColSpan())
            .rowSpan(widget.getRowSpan())
            .backgroundColor(widget.getBackgroundColor())
            .fontSize(widget.getFontSize())
            .config(widget.getConfig())
            .chartType(widget.getChartType())
            .metricField(widget.getMetricField())
            .metricLabel(widget.getMetricLabel())
            .metricFormat(widget.getMetricFormat())
            .filtersApplied(widget.getFiltersApplied())
            .sortConfig(widget.getSortConfig())
            .refreshInterval(widget.getRefreshInterval())
            .cacheDuration(widget.getCacheDuration())
            .isCached(widget.getIsCached())
            .lastRefreshedAt(widget.getLastRefreshedAt())
            .isVisible(widget.getIsVisible())
            .isLocked(widget.getIsLocked())
            .widgetOrder(widget.getWidgetOrder())
            .createdBy(widget.getCreatedBy())
            .createdAt(widget.getCreatedAt())
            .updatedAt(widget.getUpdatedAt())
            .build();
    }
}
