package com.everx.reporting.service;

import com.everx.reporting.entity.DashboardConfigEntity;
import com.everx.reporting.entity.DashboardWidgetEntity;
import com.everx.reporting.repository.DashboardConfigRepository;
import com.everx.reporting.repository.DashboardWidgetRepository;
import com.everx.reporting.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ReportingDashboardService {

    private final DashboardConfigRepository dashboardConfigRepository;
    private final DashboardWidgetRepository dashboardWidgetRepository;

    public DashboardConfigDTO getDashboard(Long dashboardId, String userEmail) {
        DashboardConfigEntity dashboard = dashboardConfigRepository.findById(dashboardId)
            .orElseThrow(() -> new RuntimeException("Dashboard not found: " + dashboardId));
        
        validateAccess(dashboard, userEmail);
        return mapToDTO(dashboard);
    }

    public Page<DashboardConfigDTO> getUserDashboards(String userEmail, Pageable pageable) {
        return dashboardConfigRepository.findByUserEmail(userEmail, pageable)
            .map(this::mapToDTO);
    }

    public DashboardConfigDTO getDefaultDashboard(String userEmail) {
        return dashboardConfigRepository.findByUserEmailAndIsDefaultTrue(userEmail)
            .map(this::mapToDTO)
            .orElseThrow(() -> new RuntimeException("No default dashboard found for user: " + userEmail));
    }

    public DashboardConfigDTO createDashboard(String userEmail, CreateDashboardRequest request) {
        DashboardConfigEntity dashboard = DashboardConfigEntity.builder()
            .userEmail(userEmail)
            .dashboardName(request.getDashboardName())
            .description(request.getDescription())
            .isDefault(request.getIsDefault() != null ? request.getIsDefault() : false)
            .isShared(request.getIsShared() != null ? request.getIsShared() : false)
            .gridColumns(request.getGridColumns() != null ? request.getGridColumns() : 12)
            .widgetsCount(0)
            .sharedWithEmails(request.getSharedWithEmails())
            .sharedWithRoles(request.getSharedWithRoles())
            .build();

        // If this is the first dashboard, make it default
        if (dashboardConfigRepository.countUserDashboards(userEmail) == 0) {
            dashboard.setIsDefault(true);
        }

        return mapToDTO(dashboardConfigRepository.save(dashboard));
    }

    public DashboardConfigDTO updateDashboard(Long dashboardId, String userEmail, UpdateDashboardRequest request) {
        DashboardConfigEntity dashboard = dashboardConfigRepository.findById(dashboardId)
            .orElseThrow(() -> new RuntimeException("Dashboard not found"));
        
        validateAccess(dashboard, userEmail);

        if (request.getDashboardName() != null) {
            dashboard.setDashboardName(request.getDashboardName());
        }
        if (request.getDescription() != null) {
            dashboard.setDescription(request.getDescription());
        }
        if (request.getIsDefault() != null) {
            dashboard.setIsDefault(request.getIsDefault());
        }
        if (request.getIsShared() != null) {
            dashboard.setIsShared(request.getIsShared());
        }
        if (request.getSharedWithEmails() != null) {
            dashboard.setSharedWithEmails(request.getSharedWithEmails());
        }
        if (request.getSharedWithRoles() != null) {
            dashboard.setSharedWithRoles(request.getSharedWithRoles());
        }

        return mapToDTO(dashboardConfigRepository.save(dashboard));
    }

    public void deleteDashboard(Long dashboardId, String userEmail) {
        DashboardConfigEntity dashboard = dashboardConfigRepository.findById(dashboardId)
            .orElseThrow(() -> new RuntimeException("Dashboard not found"));
        
        validateAccess(dashboard, userEmail);
        dashboardConfigRepository.delete(dashboard);
    }

    private void validateAccess(DashboardConfigEntity dashboard, String userEmail) {
        if (!dashboard.getUserEmail().equals(userEmail) && !dashboard.getIsShared()) {
            throw new RuntimeException("Unauthorized access to dashboard");
        }
    }

    private DashboardConfigDTO mapToDTO(DashboardConfigEntity dashboard) {
        List<DashboardWidgetDTO> widgets = dashboardWidgetRepository
            .findByDashboardConfigDashboardIdOrderByWidgetOrder(dashboard.getDashboardId())
            .stream()
            .map(this::mapWidgetToDTO)
            .collect(Collectors.toList());

        return DashboardConfigDTO.builder()
            .dashboardId(dashboard.getDashboardId())
            .userEmail(dashboard.getUserEmail())
            .dashboardName(dashboard.getDashboardName())
            .dashboardKey(dashboard.getDashboardKey())
            .description(dashboard.getDescription())
            .isDefault(dashboard.getIsDefault())
            .isShared(dashboard.getIsShared())
            .gridColumns(dashboard.getGridColumns())
            .widgetsCount(dashboard.getWidgetsCount())
            .sharedWithEmails(dashboard.getSharedWithEmails())
            .sharedWithRoles(dashboard.getSharedWithRoles())
            .widgets(widgets)
            .createdAt(dashboard.getCreatedAt())
            .updatedAt(dashboard.getUpdatedAt())
            .build();
    }

    private DashboardWidgetDTO mapWidgetToDTO(DashboardWidgetEntity widget) {
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
