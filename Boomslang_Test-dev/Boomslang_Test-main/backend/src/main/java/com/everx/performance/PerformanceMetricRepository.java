package com.everx.performance.repository;

import com.everx.performance.entity.PerformanceMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface PerformanceMetricRepository extends JpaRepository<PerformanceMetric, UUID> {

    List<PerformanceMetric> findByTenantId(UUID tenantId);

    List<PerformanceMetric> findByTenantIdAndMetricName(UUID tenantId, String metricName);

    List<PerformanceMetric> findByTenantIdAndMetricType(UUID tenantId, PerformanceMetric.MetricType metricType);

    @Query("SELECT m FROM PerformanceMetric m WHERE m.tenantId = :tenantId AND m.timestamp BETWEEN :startDate AND :endDate")
    List<PerformanceMetric> findByTenantIdAndTimestampBetween(@Param("tenantId") UUID tenantId, 
                                                              @Param("startDate") LocalDateTime startDate, 
                                                              @Param("endDate") LocalDateTime endDate);

    @Query("SELECT m FROM PerformanceMetric m WHERE m.tenantId = :tenantId AND m.metricName = :metricName AND m.timestamp BETWEEN :startDate AND :endDate")
    List<PerformanceMetric> findByTenantIdAndMetricNameAndTimestampBetween(@Param("tenantId") UUID tenantId, 
                                                                           @Param("metricName") String metricName, 
                                                                           @Param("startDate") LocalDateTime startDate, 
                                                                           @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(m) FROM PerformanceMetric m WHERE m.tenantId = :tenantId")
    long countByTenantId(@Param("tenantId") UUID tenantId);

    @Query("SELECT COUNT(m) FROM PerformanceMetric m WHERE m.tenantId = :tenantId AND m.metricType = :metricType")
    long countByTenantIdAndMetricType(@Param("tenantId") UUID tenantId, @Param("metricType") PerformanceMetric.MetricType metricType);

    @Query("SELECT m FROM PerformanceMetric m WHERE m.tenantId = :tenantId AND m.isAnomaly = true")
    List<PerformanceMetric> findAnomalousMetrics(@Param("tenantId") UUID tenantId);

    @Query("SELECT m FROM PerformanceMetric m WHERE m.tenantId = :tenantId AND m.hasHighAnomalyScore = true")
    List<PerformanceMetric> findHighAnomalyScoreMetrics(@Param("tenantId") UUID tenantId);

    @Query("SELECT m FROM PerformanceMetric m WHERE m.tenantId = :tenantId AND m.isSignificantChange = true")
    List<PerformanceMetric> findSignificantChangeMetrics(@Param("tenantId") UUID tenantId);

    @Query("SELECT m FROM PerformanceMetric m WHERE m.tenantId = :tenantId AND m.source = :source")
    List<PerformanceMetric> findByTenantIdAndSource(@Param("tenantId") UUID tenantId, @Param("source") String source);

    @Query("SELECT m FROM PerformanceMetric m WHERE m.tenantId = :tenantId AND m.service = :service")
    List<PerformanceMetric> findByTenantIdAndService(@Param("tenantId") UUID tenantId, @Param("service") String service);

    @Query("SELECT m FROM PerformanceMetric m WHERE m.tenantId = :tenantId AND m.host = :host")
    List<PerformanceMetric> findByTenantIdAndHost(@Param("tenantId") UUID tenantId, @Param("host") String host);

    @Query("SELECT m FROM PerformanceMetric m WHERE m.tenantId = :tenantId AND m.endpoint = :endpoint")
    List<PerformanceMetric> findByTenantIdAndEndpoint(@Param("tenantId") UUID tenantId, @Param("endpoint") String endpoint);

    @Query("SELECT m FROM PerformanceMetric m WHERE m.tenantId = :tenantId AND m.correlationId = :correlationId")
    List<PerformanceMetric> findByTenantIdAndCorrelationId(@Param("tenantId") UUID tenantId, @Param("correlationId") String correlationId);

    @Query("SELECT m FROM PerformanceMetric m WHERE m.tenantId = :tenantId AND m.isAboveCriticalThreshold = true")
    List<PerformanceMetric> findCriticalThresholdBreaches(@Param("tenantId") UUID tenantId);

    @Query("SELECT m FROM PerformanceMetric m WHERE m.tenantId = :tenantId AND m.isAboveWarningThreshold = true")
    List<PerformanceMetric> findWarningThresholdBreaches(@Param("tenantId") UUID tenantId);

    @Query("SELECT AVG(m.value) FROM PerformanceMetric m WHERE m.tenantId = :tenantId AND m.metricName = :metricName AND m.timestamp BETWEEN :startDate AND :endDate")
    Double getAverageMetricValue(@Param("tenantId") UUID tenantId, 
                                 @Param("metricName") String metricName, 
                                 @Param("startDate") LocalDateTime startDate, 
                                 @Param("endDate") LocalDateTime endDate);

    @Query("SELECT MAX(m.value) FROM PerformanceMetric m WHERE m.tenantId = :tenantId AND m.metricName = :metricName AND m.timestamp BETWEEN :startDate AND :endDate")
    Double getMaxMetricValue(@Param("tenantId") UUID tenantId, 
                            @Param("metricName") String metricName, 
                            @Param("startDate") LocalDateTime startDate, 
                            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT MIN(m.value) FROM PerformanceMetric m WHERE m.tenantId = :tenantId AND m.metricName = :metricName AND m.timestamp BETWEEN :startDate AND :endDate")
    Double getMinMetricValue(@Param("tenantId") UUID tenantId, 
                            @Param("metricName") String metricName, 
                            @Param("startDate") LocalDateTime startDate, 
                            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT m.metricName, COUNT(m) FROM PerformanceMetric m WHERE m.tenantId = :tenantId GROUP BY m.metricName")
    List<Object[]> getMetricNameStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT m.metricType, COUNT(m) FROM PerformanceMetric m WHERE m.tenantId = :tenantId GROUP BY m.metricType")
    List<Object[]> getMetricTypeStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT m.source, COUNT(m) FROM PerformanceMetric m WHERE m.tenantId = :tenantId GROUP BY m.source")
    List<Object[]> getSourceStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT m.service, COUNT(m) FROM PerformanceMetric m WHERE m.tenantId = :tenantId AND m.service IS NOT NULL GROUP BY m.service")
    List<Object[]> getServiceStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT m FROM PerformanceMetric m WHERE m.tenantId = :tenantId AND m.isRecent = true")
    List<PerformanceMetric> findRecentMetrics(@Param("tenantId") UUID tenantId);

    @Query("SELECT COUNT(m) FROM PerformanceMetric m WHERE m.tenantId = :tenantId AND m.isAnomaly = true AND m.timestamp > :since")
    long countRecentAnomalies(@Param("tenantId") UUID tenantId, @Param("since") LocalDateTime since);

    @Query("SELECT m FROM PerformanceMetric m WHERE m.tenantId = :tenantId AND m.tags LIKE %:tag%")
    List<PerformanceMetric> findByTenantIdAndTagContaining(@Param("tenantId") UUID tenantId, @Param("tag") String tag);

    @Query("SELECT m FROM PerformanceMetric m WHERE m.tenantId = :tenantId AND m.category = :category")
    List<PerformanceMetric> findByTenantIdAndCategory(@Param("tenantId") UUID tenantId, @Param("category") String category);

    @Query("SELECT m FROM PerformanceMetric m WHERE m.tenantId = :tenantId AND m.isSystemMetric = true")
    List<PerformanceMetric> findSystemMetrics(@Param("tenantId") UUID tenantId);

    @Query("SELECT m FROM PerformanceMetric m WHERE m.tenantId = :tenantId AND m.isApplicationMetric = true")
    List<PerformanceMetric> findApplicationMetrics(@Param("tenantId") UUID tenantId);

    @Query("SELECT m FROM PerformanceMetric m WHERE m.tenantId = :tenantId AND m.isBusinessMetric = true")
    List<PerformanceMetric> findBusinessMetrics(@Param("tenantId") UUID tenantId);
}
