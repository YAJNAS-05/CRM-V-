package com.everx.integration.repository;

import com.everx.integration.entity.IntegrationExecution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface IntegrationExecutionRepository extends JpaRepository<IntegrationExecution, UUID> {

    List<IntegrationExecution> findByTenantId(UUID tenantId);

    List<IntegrationExecution> findByTenantIdAndConfigId(UUID tenantId, UUID configId);

    List<IntegrationExecution> findByTenantIdAndStatus(UUID tenantId, IntegrationExecution.Status status);

    @Query("SELECT e FROM IntegrationExecution e WHERE e.tenantId = :tenantId AND e.status = :status ORDER BY e.startedAt DESC")
    List<IntegrationExecution> findByTenantIdAndStatusOrderByStartedAtDesc(@Param("tenantId") UUID tenantId, 
                                                                           @Param("status") IntegrationExecution.Status status);

    @Query("SELECT COUNT(e) FROM IntegrationExecution e WHERE e.tenantId = :tenantId AND e.status = :status")
    long countByTenantIdAndStatus(@Param("tenantId") UUID tenantId, @Param("status") IntegrationExecution.Status status);

    @Query("SELECT COUNT(e) FROM IntegrationExecution e WHERE e.tenantId = :tenantId")
    long countByTenantId(@Param("tenantId") UUID tenantId);

    @Query("SELECT e FROM IntegrationExecution e WHERE e.tenantId = :tenantId AND e.startedAt BETWEEN :startDate AND :endDate")
    List<IntegrationExecution> findByTenantIdAndStartedAtBetween(@Param("tenantId") UUID tenantId, 
                                                                @Param("startDate") LocalDateTime startDate, 
                                                                @Param("endDate") LocalDateTime endDate);

    @Query("SELECT e FROM IntegrationExecution e WHERE e.tenantId = :tenantId AND e.triggeredBy = :triggeredBy")
    List<IntegrationExecution> findByTenantIdAndTriggeredBy(@Param("tenantId") UUID tenantId, @Param("triggeredBy") String triggeredBy);

    @Query("SELECT e FROM IntegrationExecution e WHERE e.tenantId = :tenantId AND e.batchId = :batchId")
    List<IntegrationExecution> findByTenantIdAndBatchId(@Param("tenantId") UUID tenantId, @Param("batchId") String batchId);

    @Query("SELECT e FROM IntegrationExecution e WHERE e.tenantId = :tenantId AND e.correlationId = :correlationId")
    List<IntegrationExecution> findByTenantIdAndCorrelationId(@Param("tenantId") UUID tenantId, @Param("correlationId") String correlationId);

    @Query("SELECT e FROM IntegrationExecution e WHERE e.tenantId = :tenantId AND e.status = :status AND e.nextRetryAt < :now")
    List<IntegrationExecution> findExecutionsNeedingRetry(@Param("tenantId") UUID tenantId, 
                                                          @Param("status") IntegrationExecution.Status status, 
                                                          @Param("now") LocalDateTime now);

    @Query("SELECT e FROM IntegrationExecution e WHERE e.tenantId = :tenantId AND e.timeoutAt < :now AND e.status = :status")
    List<IntegrationExecution> findTimedOutExecutions(@Param("tenantId") UUID tenantId, 
                                                      @Param("now") LocalDateTime now, 
                                                      @Param("status") IntegrationExecution.Status status);

    @Query("SELECT AVG(e.actualDuration) FROM IntegrationExecution e WHERE e.tenantId = :tenantId AND e.status = :status AND e.actualDuration IS NOT NULL")
    Double getAverageExecutionTime(@Param("tenantId") UUID tenantId, @Param("status") IntegrationExecution.Status status);

    @Query("SELECT e.status, COUNT(e) FROM IntegrationExecution e WHERE e.tenantId = :tenantId GROUP BY e.status")
    List<Object[]> getStatusStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT SUM(e.processedRecords) FROM IntegrationExecution e WHERE e.tenantId = :tenantId AND e.status = :status")
    Long getTotalProcessedRecords(@Param("tenantId") UUID tenantId, @Param("status") IntegrationExecution.Status status);

    @Query("SELECT SUM(e.successRecords) FROM IntegrationExecution e WHERE e.tenantId = :tenantId AND e.status = :status")
    Long getTotalSuccessRecords(@Param("tenantId") UUID tenantId, @Param("status") IntegrationExecution.Status status);

    @Query("SELECT SUM(e.failureRecords) FROM IntegrationExecution e WHERE e.tenantId = :tenantId AND e.status = :status")
    Long getTotalFailureRecords(@Param("tenantId") UUID tenantId, @Param("status") IntegrationExecution.Status status);

    @Query("SELECT e FROM IntegrationExecution e WHERE e.tenantId = :tenantId AND e.errorMessage IS NOT NULL ORDER BY e.startedAt DESC")
    List<IntegrationExecution> findFailedExecutions(@Param("tenantId") UUID tenantId);

    @Query("SELECT e FROM IntegrationExecution e WHERE e.tenantId = :tenantId AND e.executionId = :executionId")
    List<IntegrationExecution> findByTenantIdAndExecutionId(@Param("tenantId") UUID tenantId, @Param("executionId") String executionId);

    @Query("SELECT e FROM IntegrationExecution e WHERE e.tenantId = :tenantId AND e.priority >= :minPriority ORDER BY e.priority DESC")
    List<IntegrationExecution> findByTenantIdAndPriorityGreaterThanEqualOrderByPriorityDesc(@Param("tenantId") UUID tenantId, 
                                                                                           @Param("minPriority") Integer minPriority);

    @Modifying
    @Query("DELETE FROM IntegrationExecution e WHERE e.tenantId = :tenantId AND e.completedAt < :cutoffDate")
    int deleteOldExecutions(@Param("tenantId") UUID tenantId, @Param("cutoffDate") LocalDateTime cutoffDate);

    @Query("SELECT COUNT(e) FROM IntegrationExecution e WHERE e.tenantId = :tenantId AND e.status = :status AND e.startedAt > :since")
    long countRecentExecutions(@Param("tenantId") UUID tenantId, 
                               @Param("status") IntegrationExecution.Status status, 
                               @Param("since") LocalDateTime since);

    @Query("SELECT e FROM IntegrationExecution e WHERE e.tenantId = :tenantId AND e.configId = :configId AND e.startedAt BETWEEN :startDate AND :endDate")
    List<IntegrationExecution> findByTenantIdAndConfigIdAndStartedAtBetween(@Param("tenantId") UUID tenantId, 
                                                                             @Param("configId") UUID configId, 
                                                                             @Param("startDate") LocalDateTime startDate, 
                                                                             @Param("endDate") LocalDateTime endDate);

    @Query("SELECT AVG(e.dataVolumeBytes) FROM IntegrationExecution e WHERE e.tenantId = :tenantId AND e.dataVolumeBytes IS NOT NULL")
    Double getAverageDataVolume(@Param("tenantId") UUID tenantId);

    @Query("SELECT e FROM IntegrationExecution e WHERE e.tenantId = :tenantId AND e.dataVolumeBytes > :maxVolume")
    List<IntegrationExecution> findByTenantIdAndDataVolumeBytesGreaterThan(@Param("tenantId") UUID tenantId, @Param("maxVolume") Long maxVolume);

    @Query("SELECT e FROM IntegrationExecution e WHERE e.tenantId = :tenantId AND e.actualDuration > :maxDuration")
    List<IntegrationExecution> findByTenantIdAndActualDurationGreaterThan(@Param("tenantId") UUID tenantId, @Param("maxDuration") Double maxDuration);

    @Query("SELECT SUM(e.actualDuration) FROM IntegrationExecution e WHERE e.tenantId = :tenantId AND e.status = :status")
    Long getTotalExecutionTime(@Param("tenantId") UUID tenantId, @Param("status") IntegrationExecution.Status status);
}
