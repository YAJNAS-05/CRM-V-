package com.everx.api.repository;

import com.everx.api.entity.ApiUsage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ApiUsageRepository extends JpaRepository<ApiUsage, UUID> {

    Page<ApiUsage> findByTenantIdOrderByTimestampDesc(UUID tenantId, Pageable pageable);

    Page<ApiUsage> findByApiKeyIdOrderByTimestampDesc(UUID apiKeyId, Pageable pageable);

    @Query("SELECT COUNT(a) FROM ApiUsage a WHERE a.tenantId = :tenantId AND a.timestamp BETWEEN :startDate AND :endDate")
    Long countByTenantIdAndTimestampBetween(@Param("tenantId") UUID tenantId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(a) FROM ApiUsage a WHERE a.tenantId = :tenantId AND a.timestamp BETWEEN :startDate AND :endDate AND a.isSuccess = true")
    Long countByTenantIdAndTimestampBetweenAndIsSuccessTrue(@Param("tenantId") UUID tenantId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT AVG(a.responseTimeMs) FROM ApiUsage a WHERE a.tenantId = :tenantId AND a.timestamp BETWEEN :startDate AND :endDate")
    Double getAverageResponseTimeByTenantIdAndTimestampBetween(@Param("tenantId") UUID tenantId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT a FROM ApiUsage a WHERE a.tenantId = :tenantId AND a.endpoint = :endpoint AND a.timestamp BETWEEN :startDate AND :endDate ORDER BY a.timestamp DESC")
    List<ApiUsage> findByTenantIdAndEndpointAndTimestampBetween(@Param("tenantId") UUID tenantId, @Param("endpoint") String endpoint, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT a FROM ApiUsage a WHERE a.statusCode >= 400 AND a.tenantId = :tenantId AND a.timestamp BETWEEN :startDate AND :endDate ORDER BY a.timestamp DESC")
    List<ApiUsage> findErrorRequestsByTenantIdAndTimestampBetween(@Param("tenantId") UUID tenantId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT a FROM ApiUsage a WHERE a.ipAddress = :ipAddress AND a.tenantId = :tenantId AND a.timestamp BETWEEN :startDate AND :endDate ORDER BY a.timestamp DESC")
    List<ApiUsage> findByIpAddressAndTenantIdAndTimestampBetween(@Param("ipAddress") String ipAddress, @Param("tenantId") UUID tenantId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Modifying
    @Query("DELETE FROM ApiUsage a WHERE a.timestamp < :cutoffDate")
    int deleteByTimestampBefore(@Param("cutoffDate") LocalDateTime cutoffDate);

    @Query("SELECT COUNT(a) FROM ApiUsage a WHERE a.timestamp >= :startDate")
    Long countUsageSince(@Param("startDate") LocalDateTime startDate);

    @Query("SELECT DISTINCT a.endpoint FROM ApiUsage a WHERE a.tenantId = :tenantId AND a.timestamp BETWEEN :startDate AND :endDate")
    List<String> findDistinctEndpointsByTenantIdAndTimestampBetween(@Param("tenantId") UUID tenantId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT a.statusCode, COUNT(a) FROM ApiUsage a WHERE a.tenantId = :tenantId AND a.timestamp BETWEEN :startDate AND :endDate GROUP BY a.statusCode ORDER BY COUNT(a) DESC")
    List<Object[]> getStatusCodeDistributionByTenantIdAndTimestampBetween(@Param("tenantId") UUID tenantId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}
