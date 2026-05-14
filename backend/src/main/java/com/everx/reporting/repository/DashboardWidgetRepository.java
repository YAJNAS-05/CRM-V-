package com.everx.reporting.repository;

import com.everx.reporting.entity.DashboardWidgetEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DashboardWidgetRepository extends JpaRepository<DashboardWidgetEntity, Long> {
    
    List<DashboardWidgetEntity> findByDashboardConfigDashboardIdOrderByWidgetOrder(Long dashboardId);
    
    Optional<DashboardWidgetEntity> findByWidgetIdAndDashboardConfigDashboardId(Long widgetId, Long dashboardId);
    
    @Query("SELECT w FROM DashboardWidgetEntity w WHERE w.dashboardConfig.dashboardId = :dashboardId AND w.isVisible = true ORDER BY w.widgetOrder ASC")
    List<DashboardWidgetEntity> findVisibleWidgets(@Param("dashboardId") Long dashboardId);
    
    @Query("SELECT w FROM DashboardWidgetEntity w WHERE w.dashboardConfig.dashboardId = :dashboardId AND w.reportId = :reportId")
    List<DashboardWidgetEntity> findByDashboardAndReport(@Param("dashboardId") Long dashboardId, @Param("reportId") Long reportId);
    
    @Query("SELECT COUNT(w) FROM DashboardWidgetEntity w WHERE w.dashboardConfig.dashboardId = :dashboardId")
    long countWidgetsInDashboard(@Param("dashboardId") Long dashboardId);
    
    List<DashboardWidgetEntity> findByWidgetType(String widgetType);
}
