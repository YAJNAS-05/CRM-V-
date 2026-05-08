package com.everx.integration.repository;

import com.everx.integration.entity.IntegrationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface IntegrationLogRepository extends JpaRepository<IntegrationLog, UUID> {

    List<IntegrationLog> findByTenantId(UUID tenantId);

    List<IntegrationLog> findByTenantIdAndEventType(UUID tenantId, String eventType);

    List<IntegrationLog> findByTenantIdAndSeverity(UUID tenantId, IntegrationLog.Severity severity);

    @Query("SELECT l FROM IntegrationLog l WHERE l.tenantId = :tenantId AND l.isResolved = false")
    List<IntegrationLog> findUnresolvedLogs(@Param("tenantId") UUID tenantId);

    @Query("SELECT l FROM IntegrationLog l WHERE l.tenantId = :tenantId AND l.requiresAction = true AND l.actionTaken = false")
    List<IntegrationLog> findLogsRequiringAction(@Param("tenantId") UUID tenantId);

    @Query("SELECT l FROM IntegrationLog l WHERE l.tenantId = :tenantId AND l.severity IN :severities AND l.isResolved = false")
    List<IntegrationLog> findByTenantIdAndSeverityInAndIsResolved(@Param("tenantId") UUID tenantId, 
                                                                   @Param("severities") List<IntegrationLog.Severity> severities, 
                                                                   Boolean isResolved);

    @Query("SELECT COUNT(l) FROM IntegrationLog l WHERE l.tenantId = :tenantId")
    long countByTenantId(@Param("tenantId") UUID tenantId);

    @Query("SELECT COUNT(l) FROM IntegrationLog l WHERE l.tenantId = :tenantId AND l.severity = :severity")
    long countByTenantIdAndSeverity(@Param("tenantId") UUID tenantId, @Param("severity") IntegrationLog.Severity severity);

    @Query("SELECT l FROM IntegrationLog l WHERE l.tenantId = :tenantId AND l.timestamp BETWEEN :startDate AND :endDate")
    List<IntegrationLog> findByTenantIdAndTimestampBetween(@Param("tenantId") UUID tenantId, 
                                                           @Param("startDate") LocalDateTime startDate, 
                                                           @Param("endDate") LocalDateTime endDate);

    @Query("SELECT l FROM IntegrationLog l WHERE l.tenantId = :tenantId AND l.integrationId = :integrationId")
    List<IntegrationLog> findByTenantIdAndIntegrationId(@Param("tenantId") UUID tenantId, @Param("integrationId") UUID integrationId);

    @Query("SELECT l FROM IntegrationLog l WHERE l.tenantId = :tenantId AND l.executionId = :executionId")
    List<IntegrationLog> findByTenantIdAndExecutionId(@Param("tenantId") UUID tenantId, @Param("executionId") UUID executionId);

    @Query("SELECT l FROM IntegrationLog l WHERE l.tenantId = :tenantId AND l.systemName = :systemName")
    List<IntegrationLog> findByTenantIdAndSystemName(@Param("tenantId") UUID tenantId, @Param("systemName") String systemName);

    @Query("SELECT l FROM IntegrationLog l WHERE l.tenantId = :tenantId AND l.operation = :operation")
    List<IntegrationLog> findByTenantIdAndOperation(@Param("tenantId") UUID tenantId, @Param("operation") String operation);

    @Query("SELECT l FROM IntegrationLog l WHERE l.tenantId = :tenantId AND l.correlationId = :correlationId")
    List<IntegrationLog> findByTenantIdAndCorrelationId(@Param("tenantId") UUID tenantId, @Param("correlationId") String correlationId);

    @Query("SELECT l FROM IntegrationLog l WHERE l.tenantId = :tenantId AND l.userId = :userId")
    List<IntegrationLog> findByTenantIdAndUserId(@Param("tenantId") UUID tenantId, @Param("userId") String userId);

    @Query("SELECT l FROM IntegrationLog l WHERE l.tenantId = :tenantId AND l.hasError = true")
    List<IntegrationLog> findErrorLogs(@Param("tenantId") UUID tenantId);

    @Query("SELECT l FROM IntegrationLog l WHERE l.tenantId = :tenantId AND l.isSlowOperation = true")
    List<IntegrationLog> findSlowOperations(@Param("tenantId") UUID tenantId);

    @Query("SELECT l FROM IntegrationLog l WHERE l.tenantId = :tenantId AND l.isHighVolume = true")
    List<IntegrationLog> findHighVolumeOperations(@Param("tenantId") UUID tenantId);

    @Modifying
    @Query("DELETE FROM IntegrationLog l WHERE l.tenantId = :tenantId AND l.timestamp < :cutoffDate AND l.isResolved = true")
    int deleteOldResolvedLogs(@Param("tenantId") UUID tenantId, @Param("cutoffDate") LocalDateTime cutoffDate);

    @Query("SELECT l.severity, COUNT(l) FROM IntegrationLog l WHERE l.tenantId = :tenantId AND l.timestamp BETWEEN :startDate AND :endDate GROUP BY l.severity")
    List<Object[]> getSeverityStats(@Param("tenantId") UUID tenantId, 
                                    @Param("startDate") LocalDateTime startDate, 
                                    @Param("endDate") LocalDateTime endDate);

    @Query("SELECT l.eventType, COUNT(l) FROM IntegrationLog l WHERE l.tenantId = :tenantId AND l.timestamp BETWEEN :startDate AND :endDate GROUP BY l.eventType ORDER BY COUNT(l) DESC")
    List<Object[]> getEventTypeStats(@Param("tenantId") UUID tenantId, 
                                     @Param("startDate") LocalDateTime startDate, 
                                     @Param("endDate") LocalDateTime endDate);

    @Query("SELECT l.systemName, COUNT(l) FROM IntegrationLog l WHERE l.tenantId = :tenantId AND l.timestamp BETWEEN :startDate AND :endDate GROUP BY l.systemName")
    List<Object[]> getSystemNameStats(@Param("tenantId") UUID tenantId, 
                                      @Param("startDate") LocalDateTime startDate, 
                                      @Param("endDate") LocalDateTime endDate);

    @Query("SELECT l.operation, COUNT(l) FROM IntegrationLog l WHERE l.tenantId = :tenantId AND l.timestamp BETWEEN :startDate AND :endDate GROUP BY l.operation")
    List<Object[]> getOperationStats(@Param("tenantId") UUID tenantId, 
                                     @Param("startDate") LocalDateTime startDate, 
                                     @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(l) FROM IntegrationLog l WHERE l.tenantId = :tenantId AND l.severity IN :severities AND l.timestamp BETWEEN :startDate AND :endDate")
    long countByTenantIdAndSeverityInAndTimestampBetween(@Param("tenantId") UUID tenantId, 
                                                          @Param("severities") List<IntegrationLog.Severity> severities, 
                                                          @Param("startDate") LocalDateTime startDate, 
                                                          @Param("endDate") LocalDateTime endDate);

    @Query("SELECT l FROM IntegrationLog l WHERE l.tenantId = :tenantId AND l.isResolved = false ORDER BY l.timestamp DESC")
    List<IntegrationLog> findUnresolvedLogsOrderByTimestampDesc(@Param("tenantId") UUID tenantId);

    @Query("SELECT l FROM IntegrationLog l WHERE l.tenantId = :tenantId AND l.requiresAction = true ORDER BY l.timestamp DESC")
    List<IntegrationLog> findLogsRequiringActionOrderByTimestampDesc(@Param("tenantId") UUID tenantId);

    @Query("SELECT COUNT(l) FROM IntegrationLog l WHERE l.tenantId = :tenantId AND l.isResolved = true AND l.resolvedAt BETWEEN :startDate AND :endDate")
    long countResolvedLogsByPeriod(@Param("tenantId") UUID tenantId, 
                                  @Param("startDate") LocalDateTime startDate, 
                                  @Param("endDate") LocalDateTime endDate);

    @Query("SELECT AVG(l.durationMs) FROM IntegrationLog l WHERE l.tenantId = :tenantId AND l.durationMs IS NOT NULL AND l.timestamp BETWEEN :startDate AND :endDate")
    Double getAverageDurationByPeriod(@Param("tenantId") UUID tenantId, 
                                     @Param("startDate") LocalDateTime startDate, 
                                     @Param("endDate") LocalDateTime endDate);

    @Query("SELECT SUM(l.dataVolumeBytes) FROM IntegrationLog l WHERE l.tenantId = :tenantId AND l.dataVolumeBytes IS NOT NULL AND l.timestamp BETWEEN :startDate AND :endDate")
    Long getTotalDataVolumeByPeriod(@Param("tenantId") UUID tenantId, 
                                   @Param("startDate") LocalDateTime startDate, 
                                   @Param("endDate") LocalDateTime endDate);

    @Query("SELECT l FROM IntegrationLog l WHERE l.tenantId = :tenantId AND l.hasData = true")
    List<IntegrationLog> findLogsWithData(@Param("tenantId") UUID tenantId);

    @Query("SELECT l FROM IntegrationLog l WHERE l.tenantId = :tenantId AND l.isRecent = true")
    List<IntegrationLog> findRecentLogs(@Param("tenantId") UUID tenantId);
}
