package com.everx.customersuccess.repository;

import com.everx.customersuccess.model.CustomerSuccessMetrics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CustomerSuccessMetricsRepository extends JpaRepository<CustomerSuccessMetrics, Long> {
    
    List<CustomerSuccessMetrics> findByCustomerId(Long customerId);
    
    List<CustomerSuccessMetrics> findByManagerId(Long managerId);
    
    List<CustomerSuccessMetrics> findByMetricType(String metricType);
    
    List<CustomerSuccessMetrics> findByCategory(String category);
    
    List<CustomerSuccessMetrics> findByRecordedDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("SELECT m FROM CustomerSuccessMetrics m WHERE m.customerId = :customerId AND m.metricType = :metricType ORDER BY m.recordedDate DESC")
    List<CustomerSuccessMetrics> findLatestMetricsByCustomerAndType(@Param("customerId") Long customerId, @Param("metricType") String metricType);
    
    @Query("SELECT m FROM CustomerSuccessMetrics m WHERE m.managerId = :managerId AND m.recordedDate >= :since")
    List<CustomerSuccessMetrics> findManagerMetricsSince(@Param("managerId") Long managerId, @Param("since") LocalDateTime since);
    
    @Query("SELECT AVG(m.value) FROM CustomerSuccessMetrics m WHERE m.metricType = :metricType AND m.recordedDate >= :since")
    Double getAverageMetricValue(@Param("metricType") String metricType, @Param("since") LocalDateTime since);
    
    @Query("SELECT m FROM CustomerSuccessMetrics m WHERE m.value < m.target")
    List<CustomerSuccessMetrics> findMetricsBelowTarget();
    
    @Query("SELECT DISTINCT m.metricType FROM CustomerSuccessMetrics m")
    List<String> findAllMetricTypes();
    
    @Query("SELECT m FROM CustomerSuccessMetrics m WHERE m.changePercentage < :threshold")
    List<CustomerSuccessMetrics> findDecliningMetrics(@Param("threshold") Double threshold);
    
    @Query("SELECT COUNT(m) FROM CustomerSuccessMetrics m WHERE m.recordedDate >= :since")
    Long countMetricsRecordedSince(@Param("since") LocalDateTime since);
}
