package com.everx.performance.repository;

import com.everx.performance.entity.PerformanceAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface PerformanceAlertRepository extends JpaRepository<PerformanceAlert, UUID> {

    List<PerformanceAlert> findByTenantId(UUID tenantId);

    List<PerformanceAlert> findByTenantIdAndStatus(UUID tenantId, PerformanceAlert.Status status);

    List<PerformanceAlert> findByTenantIdAndSeverity(UUID tenantId, PerformanceAlert.Severity severity);

    @Query("SELECT a FROM PerformanceAlert a WHERE a.tenantId = :tenantId AND a.isActive = true")
    List<PerformanceAlert> findActiveAlerts(@Param("tenantId") UUID tenantId);

    @Query("SELECT a FROM PerformanceAlert a WHERE a.tenantId = :tenantId AND a.isAcknowledged = false")
    List<PerformanceAlert> findUnacknowledgedAlerts(@Param("tenantId") UUID tenantId);

    @Query("SELECT a FROM PerformanceAlert a WHERE a.tenantId = :tenantId AND a.isEscalated = true")
    List<PerformanceAlert> findEscalatedAlerts(@Param("tenantId") UUID tenantId);

    @Query("SELECT a FROM PerformanceAlert a WHERE a.tenantId = :tenantId AND a.requiresEscalation = true")
    List<PerformanceAlert> findAlertsRequiringEscalation(@Param("tenantId") UUID tenantId);

    @Query("SELECT a FROM PerformanceAlert a WHERE a.tenantId = :tenantId AND a.isOverdue = true")
    List<PerformanceAlert> findOverdueAlerts(@Param("tenantId") UUID tenantId);

    @Query("SELECT COUNT(a) FROM PerformanceAlert a WHERE a.tenantId = :tenantId AND a.status = :status")
    long countByTenantIdAndStatus(@Param("tenantId") UUID tenantId, @Param("status") PerformanceAlert.Status status);

    @Query("SELECT COUNT(a) FROM PerformanceAlert a WHERE a.tenantId = :tenantId")
    long countByTenantId(@Param("tenantId") UUID tenantId);

    @Query("SELECT a FROM PerformanceAlert a WHERE a.tenantId = :tenantId AND a.triggeredAt BETWEEN :startDate AND :endDate")
    List<PerformanceAlert> findByTenantIdAndTriggeredAtBetween(@Param("tenantId") UUID tenantId, 
                                                                @Param("startDate") LocalDateTime startDate, 
                                                                @Param("endDate") LocalDateTime endDate);

    @Query("SELECT a FROM PerformanceAlert a WHERE a.tenantId = :tenantId AND a.metricName = :metricName")
    List<PerformanceAlert> findByTenantIdAndMetricName(@Param("tenantId") UUID tenantId, @Param("metricName") String metricName);

    @Query("SELECT a FROM PerformanceAlert a WHERE a.tenantId = :tenantId AND a.alertType = :alertType")
    List<PerformanceAlert> findByTenantIdAndAlertType(@Param("tenantId") UUID tenantId, @Param("alertType") PerformanceAlert.AlertType alertType);

    @Query("SELECT a FROM PerformanceAlert a WHERE a.tenantId = :tenantId AND a.source = :source")
    List<PerformanceAlert> findByTenantIdAndSource(@Param("tenantId") UUID tenantId, @Param("source") String source);

    @Query("SELECT a FROM PerformanceAlert a WHERE a.tenantId = :tenantId AND a.service = :service")
    List<PerformanceAlert> findByTenantIdAndService(@Param("tenantId") UUID tenantId, @Param("service") String service);

    @Query("SELECT a FROM PerformanceAlert a WHERE a.tenantId = :tenantId AND a.correlationId = :correlationId")
    List<PerformanceAlert> findByTenantIdAndCorrelationId(@Param("tenantId") UUID tenantId, @Param("correlationId") String correlationId);

    @Query("SELECT a FROM PerformanceAlert a WHERE a.tenantId = :tenantId AND a.assignedTo = :assignedTo")
    List<PerformanceAlert> findByTenantIdAndAssignedTo(@Param("tenantId") UUID tenantId, @Param("assignedTo") String assignedTo);

    @Query("SELECT a FROM PerformanceAlert a WHERE a.tenantId = :tenantId AND a.isFalsePositive = true")
    List<PerformanceAlert> findFalsePositiveAlerts(@Param("tenantId") UUID tenantId);

    @Query("SELECT a FROM PerformanceAlert a WHERE a.tenantId = :tenantId AND a.isAutoResolved = true")
    List<PerformanceAlert> findAutoResolvedAlerts(@Param("tenantId") UUID tenantId);

    @Query("SELECT a FROM PerformanceAlert a WHERE a.tenantId = :tenantId AND a.hasNotificationsSent = true")
    List<PerformanceAlert> findAlertsWithNotificationsSent(@Param("tenantId") UUID tenantId);

    @Query("SELECT a FROM PerformanceAlert a WHERE a.tenantId = :tenantId AND a.isLongRunning = true")
    List<PerformanceAlert> findLongRunningAlerts(@Param("tenantId") UUID tenantId);

    @Query("SELECT a.severity, COUNT(a) FROM PerformanceAlert a WHERE a.tenantId = :tenantId GROUP BY a.severity")
    List<Object[]> getSeverityStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT a.alertType, COUNT(a) FROM PerformanceAlert a WHERE a.tenantId = :tenantId GROUP BY a.alertType")
    List<Object[]> getAlertTypeStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT a.status, COUNT(a) FROM PerformanceAlert a WHERE a.tenantId = :tenantId GROUP BY a.status")
    List<Object[]> getStatusStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT a.source, COUNT(a) FROM PerformanceAlert a WHERE a.tenantId = :tenantId AND a.source IS NOT NULL GROUP BY a.source")
    List<Object[]> getSourceStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT a.service, COUNT(a) FROM PerformanceAlert a WHERE a.tenantId = :tenantId AND a.service IS NOT NULL GROUP BY a.service")
    List<Object[]> getServiceStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT AVG(a.getDurationMinutes()) FROM PerformanceAlert a WHERE a.tenantId = :tenantId AND a.resolvedAt IS NOT NULL")
    Double getAverageResolutionTime(@Param("tenantId") UUID tenantId);

    @Query("SELECT a FROM PerformanceAlert a WHERE a.tenantId = :tenantId AND a.category = :category")
    List<PerformanceAlert> findByTenantIdAndCategory(@Param("tenantId") UUID tenantId, @Param("category") String category);

    @Query("SELECT a FROM PerformanceAlert a WHERE a.tenantId = :tenantId AND a.impactLevel = :impactLevel")
    List<PerformanceAlert> findByTenantIdAndImpactLevel(@Param("tenantId") UUID tenantId, @Param("impactLevel") String impactLevel);

    @Query("SELECT a FROM PerformanceAlert a WHERE a.tenantId = :tenantId AND a.urgency = :urgency")
    List<PerformanceAlert> findByTenantIdAndUrgency(@Param("tenantId") UUID tenantId, @Param("urgency") String urgency);

    @Query("SELECT COUNT(a) FROM PerformanceAlert a WHERE a.tenantId = :tenantId AND a.severity IN :severities AND a.status = :status")
    long countByTenantIdAndSeverityInAndStatus(@Param("tenantId") UUID tenantId, 
                                              @Param("severities") List<PerformanceAlert.Severity> severities, 
                                              @Param("status") PerformanceAlert.Status status);

    @Query("SELECT a FROM PerformanceAlert a WHERE a.tenantId = :tenantId AND a.isActive = true ORDER BY a.triggeredAt DESC")
    List<PerformanceAlert> findActiveAlertsOrderByTriggeredAtDesc(@Param("tenantId") UUID tenantId);

    @Query("SELECT COUNT(a) FROM PerformanceAlert a WHERE a.tenantId = :tenantId AND a.isResolved = true AND a.resolvedAt BETWEEN :startDate AND :endDate")
    long countResolvedAlertsByPeriod(@Param("tenantId") UUID tenantId, 
                                     @Param("startDate") LocalDateTime startDate, 
                                     @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(a) FROM PerformanceAlert a WHERE a.tenantId = :tenantId AND a.isActive = true AND a.triggeredAt > :since")
    long countActiveAlertsSince(@Param("tenantId") UUID tenantId, @Param("since") LocalDateTime since);
}
