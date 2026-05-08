package com.everx.integration.repository;

import com.everx.integration.entity.IntegrationConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface IntegrationConfigRepository extends JpaRepository<IntegrationConfig, UUID> {

    List<IntegrationConfig> findByTenantId(UUID tenantId);

    List<IntegrationConfig> findByTenantIdAndStatus(UUID tenantId, IntegrationConfig.Status status);

    List<IntegrationConfig> findByTenantIdAndIntegrationType(UUID tenantId, IntegrationConfig.IntegrationType integrationType);

    @Query("SELECT i FROM IntegrationConfig i WHERE i.tenantId = :tenantId AND i.status = :status ORDER BY i.priority DESC")
    List<IntegrationConfig> findByTenantIdAndStatusOrderByPriorityDesc(@Param("tenantId") UUID tenantId, 
                                                                         @Param("status") IntegrationConfig.Status status);

    @Query("SELECT COUNT(i) FROM IntegrationConfig i WHERE i.tenantId = :tenantId AND i.status = :status")
    long countByTenantIdAndStatus(@Param("tenantId") UUID tenantId, @Param("status") IntegrationConfig.Status status);

    @Query("SELECT COUNT(i) FROM IntegrationConfig i WHERE i.tenantId = :tenantId")
    long countByTenantId(@Param("tenantId") UUID tenantId);

    @Query("SELECT i FROM IntegrationConfig i WHERE i.tenantId = :tenantId AND i.nextSyncAt < :now AND i.status = :status")
    List<IntegrationConfig> findConfigsNeedingSync(@Param("tenantId") UUID tenantId, @Param("now") LocalDateTime now, @Param("status") IntegrationConfig.Status status);

    @Query("SELECT i FROM IntegrationConfig i WHERE i.tenantId = :tenantId AND i.sourceSystem = :sourceSystem")
    List<IntegrationConfig> findByTenantIdAndSourceSystem(@Param("tenantId") UUID tenantId, @Param("sourceSystem") String sourceSystem);

    @Query("SELECT i FROM IntegrationConfig i WHERE i.tenantId = :tenantId AND i.targetSystem = :targetSystem")
    List<IntegrationConfig> findByTenantIdAndTargetSystem(@Param("tenantId") UUID tenantId, @Param("targetSystem") String targetSystem);

    @Query("SELECT i FROM IntegrationConfig i WHERE i.tenantId = :tenantId AND i.createdBy = :createdBy")
    List<IntegrationConfig> findByTenantIdAndCreatedBy(@Param("tenantId") UUID tenantId, @Param("createdBy") String createdBy);

    @Query("SELECT i FROM IntegrationConfig i WHERE i.tenantId = :tenantId AND i.lastSyncAt BETWEEN :startDate AND :endDate")
    List<IntegrationConfig> findByTenantIdAndLastSyncAtBetween(@Param("tenantId") UUID tenantId, 
                                                              @Param("startDate") LocalDateTime startDate, 
                                                              @Param("endDate") LocalDateTime endDate);

    @Query("SELECT i FROM IntegrationConfig i WHERE i.tenantId = :tenantId AND i.healthStatus = :healthStatus")
    List<IntegrationConfig> findByTenantIdAndHealthStatus(@Param("tenantId") UUID tenantId, @Param("healthStatus") String healthStatus);

    @Query("SELECT i FROM IntegrationConfig i WHERE i.tenantId = :tenantId AND i.lastHealthCheckAt < :cutoffDate")
    List<IntegrationConfig> findConfigsNeedingHealthCheck(@Param("tenantId") UUID tenantId, @Param("cutoffDate") LocalDateTime cutoffDate);

    @Query("SELECT COUNT(i) FROM IntegrationConfig i WHERE i.tenantId = :tenantId AND i.integrationType = :integrationType AND i.status = :status")
    long countByTenantIdAndIntegrationTypeAndStatus(@Param("tenantId") UUID tenantId, 
                                                    @Param("integrationType") IntegrationConfig.IntegrationType integrationType, 
                                                    @Param("status") IntegrationConfig.Status status);

    @Query("SELECT i.integrationType, COUNT(i) FROM IntegrationConfig i WHERE i.tenantId = :tenantId GROUP BY i.integrationType")
    List<Object[]> getIntegrationTypeStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT i.status, COUNT(i) FROM IntegrationConfig i WHERE i.tenantId = :tenantId GROUP BY i.status")
    List<Object[]> getStatusStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT AVG(i.successRate) FROM IntegrationConfig i WHERE i.tenantId = :tenantId AND i.syncCount > 0")
    Double getAverageSuccessRate(@Param("tenantId") UUID tenantId);

    @Query("SELECT i FROM IntegrationConfig i WHERE i.tenantId = :tenantId AND i.name LIKE %:name%")
    List<IntegrationConfig> findByTenantIdAndNameContaining(@Param("tenantId") UUID tenantId, @Param("name") String name);

    @Query("SELECT i FROM IntegrationConfig i WHERE i.tenantId = :tenantId AND i.priority >= :minPriority ORDER BY i.priority DESC")
    List<IntegrationConfig> findByTenantIdAndPriorityGreaterThanEqualOrderByPriorityDesc(@Param("tenantId") UUID tenantId, 
                                                                                         @Param("minPriority") Integer minPriority);

    @Query("SELECT SUM(i.syncCount) FROM IntegrationConfig i WHERE i.tenantId = :tenantId")
    Long getTotalSyncCount(@Param("tenantId") UUID tenantId);

    @Query("SELECT SUM(i.successCount) FROM IntegrationConfig i WHERE i.tenantId = :tenantId")
    Long getTotalSuccessCount(@Param("tenantId") UUID tenantId);

    @Query("SELECT SUM(i.failureCount) FROM IntegrationConfig i WHERE i.tenantId = :tenantId")
    Long getTotalFailureCount(@Param("tenantId") UUID tenantId);

    @Query("SELECT i FROM IntegrationConfig i WHERE i.tenantId = :tenantId AND i.category = :category")
    List<IntegrationConfig> findByTenantIdAndCategory(@Param("tenantId") UUID tenantId, @Param("category") String category);

    @Query("SELECT i FROM IntegrationConfig i WHERE i.tenantId = :tenantId AND i.isPublic = true")
    List<IntegrationConfig> findPublicConfigs(@Param("tenantId") UUID tenantId);

    @Query("SELECT i FROM IntegrationConfig i WHERE i.tenantId = :tenantId AND i.version > :minVersion")
    List<IntegrationConfig> findByTenantIdAndVersionGreaterThan(@Param("tenantId") UUID tenantId, @Param("minVersion") Integer minVersion);
}
