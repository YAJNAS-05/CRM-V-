package com.everx.integration.repository;

import com.everx.integration.entity.ExternalSystem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ExternalSystemRepository extends JpaRepository<ExternalSystem, UUID> {

    List<ExternalSystem> findByTenantId(UUID tenantId);

    List<ExternalSystem> findByTenantIdAndStatus(UUID tenantId, ExternalSystem.Status status);

    List<ExternalSystem> findByTenantIdAndSystemType(UUID tenantId, ExternalSystem.SystemType systemType);

    @Query("SELECT s FROM ExternalSystem s WHERE s.tenantId = :tenantId AND s.healthStatus = :healthStatus")
    List<ExternalSystem> findByTenantIdAndHealthStatus(@Param("tenantId") UUID tenantId, @Param("healthStatus") ExternalSystem.HealthStatus healthStatus);

    @Query("SELECT COUNT(s) FROM ExternalSystem s WHERE s.tenantId = :tenantId AND s.status = :status")
    long countByTenantIdAndStatus(@Param("tenantId") UUID tenantId, @Param("status") ExternalSystem.Status status);

    @Query("SELECT COUNT(s) FROM ExternalSystem s WHERE s.tenantId = :tenantId")
    long countByTenantId(@Param("tenantId") UUID tenantId);

    @Query("SELECT s FROM ExternalSystem s WHERE s.tenantId = :tenantId AND s.lastHealthCheckAt < :cutoffDate")
    List<ExternalSystem> findSystemsNeedingHealthCheck(@Param("tenantId") UUID tenantId, @Param("cutoffDate") LocalDateTime cutoffDate);

    @Query("SELECT s FROM ExternalSystem s WHERE s.tenantId = :tenantId AND s.isMonitored = true AND s.lastHealthCheckAt < :cutoffDate")
    List<ExternalSystem> findMonitoredSystemsNeedingHealthCheck(@Param("tenantId") UUID tenantId, @Param("cutoffDate") LocalDateTime cutoffDate);

    @Query("SELECT s FROM ExternalSystem s WHERE s.tenantId = :tenantId AND s.createdBy = :createdBy")
    List<ExternalSystem> findByTenantIdAndCreatedBy(@Param("tenantId") UUID tenantId, @Param("createdBy") String createdBy);

    @Query("SELECT s FROM ExternalSystem s WHERE s.tenantId = :tenantId AND s.lastConnectionAt BETWEEN :startDate AND :endDate")
    List<ExternalSystem> findByTenantIdAndLastConnectionAtBetween(@Param("tenantId") UUID tenantId, 
                                                                  @Param("startDate") LocalDateTime startDate, 
                                                                  @Param("endDate") LocalDateTime endDate);

    @Query("SELECT s FROM ExternalSystem s WHERE s.tenantId = :tenantId AND s.lastErrorAt < :cutoffDate")
    List<ExternalSystem> findSystemsWithRecentErrors(@Param("tenantId") UUID tenantId, @Param("cutoffDate") LocalDateTime cutoffDate);

    @Query("SELECT s FROM ExternalSystem s WHERE s.tenantId = :tenantId AND s.errorCount > :maxErrors")
    List<ExternalSystem> findByTenantIdAndErrorCountGreaterThan(@Param("tenantId") UUID tenantId, @Param("maxErrors") Long maxErrors);

    @Query("SELECT s FROM ExternalSystem s WHERE s.tenantId = :tenantId AND s.category = :category")
    List<ExternalSystem> findByTenantIdAndCategory(@Param("tenantId") UUID tenantId, @Param("category") String category);

    @Query("SELECT s FROM ExternalSystem s WHERE s.tenantId = :tenantId AND s.environment = :environment")
    List<ExternalSystem> findByTenantIdAndEnvironment(@Param("tenantId") UUID tenantId, @Param("environment") String environment);

    @Query("SELECT s FROM ExternalSystem s WHERE s.tenantId = :tenantId AND s.owner = :owner")
    List<ExternalSystem> findByTenantIdAndOwner(@Param("tenantId") UUID tenantId, @Param("owner") String owner);

    @Query("SELECT AVG(s.responseTime) FROM ExternalSystem s WHERE s.tenantId = :tenantId AND s.responseTime IS NOT NULL")
    Double getAverageResponseTime(@Param("tenantId") UUID tenantId);

    @Query("SELECT s.systemType, COUNT(s) FROM ExternalSystem s WHERE s.tenantId = :tenantId GROUP BY s.systemType")
    List<Object[]> getSystemTypeStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT s.status, COUNT(s) FROM ExternalSystem s WHERE s.tenantId = :tenantId GROUP BY s.status")
    List<Object[]> getStatusStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT s.healthStatus, COUNT(s) FROM ExternalSystem s WHERE s.tenantId = :tenantId GROUP BY s.healthStatus")
    List<Object[]> getHealthStatusStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT s FROM ExternalSystem s WHERE s.tenantId = :tenantId AND s.name LIKE %:name%")
    List<ExternalSystem> findByTenantIdAndNameContaining(@Param("tenantId") UUID tenantId, @Param("name") String name);

    @Query("SELECT SUM(s.connectionCount) FROM ExternalSystem s WHERE s.tenantId = :tenantId")
    Long getTotalConnectionCount(@Param("tenantId") UUID tenantId);

    @Query("SELECT SUM(s.activeConnections) FROM ExternalSystem s WHERE s.tenantId = :tenantId")
    Long getTotalActiveConnections(@Param("tenantId") UUID tenantId);

    @Query("SELECT SUM(s.errorCount) FROM ExternalSystem s WHERE s.tenantId = :tenantId")
    Long getTotalErrorCount(@Param("tenantId") UUID tenantId);

    @Query("SELECT s FROM ExternalSystem s WHERE s.tenantId = :tenantId AND s.hasTimeout = true")
    List<ExternalSystem> findSystemsWithTimeout(@Param("tenantId") UUID tenantId);

    @Query("SELECT s FROM ExternalSystem s WHERE s.tenantId = :tenantId AND s.isAtRateLimit = true")
    List<ExternalSystem> findSystemsAtRateLimit(@Param("tenantId") UUID tenantId);

    @Query("SELECT s FROM ExternalSystem s WHERE s.tenantId = :tenantId AND s.canRetry = false")
    List<ExternalSystem> findSystemsThatCannotRetry(@Param("tenantId") UUID tenantId);

    @Query("SELECT COUNT(s) FROM ExternalSystem s WHERE s.tenantId = :tenantId AND s.healthStatus = 'HEALTHY'")
    long countHealthySystems(@Param("tenantId") UUID tenantId);

    @Query("SELECT COUNT(s) FROM ExternalSystem s WHERE s.tenantId = :tenantId AND s.healthStatus = 'UNHEALTHY'")
    long countUnhealthySystems(@Param("tenantId") UUID tenantId);

    @Query("SELECT s FROM ExternalSystem s WHERE s.tenantId = :tenantId AND s.apiVersion = :apiVersion")
    List<ExternalSystem> findByTenantIdAndApiVersion(@Param("tenantId") UUID tenantId, @Param("apiVersion") String apiVersion);

    @Query("SELECT s FROM ExternalSystem s WHERE s.tenantId = :tenantId AND s.authenticationType = :authType")
    List<ExternalSystem> findByTenantIdAndAuthenticationType(@Param("tenantId") UUID tenantId, @Param("authType") ExternalSystem.AuthenticationType authType);
}
