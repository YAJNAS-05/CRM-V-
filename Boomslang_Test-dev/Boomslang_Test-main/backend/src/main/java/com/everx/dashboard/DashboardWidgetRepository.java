package com.everx.dashboard;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DashboardWidgetRepository extends JpaRepository<DashboardWidget, UUID> {

    List<DashboardWidget> findByUserIdAndDashboardType(UUID userId, String dashboardType);

    List<DashboardWidget> findByUserId(UUID userId);

    void deleteByUserIdAndDashboardType(UUID userId, String dashboardType);
}
