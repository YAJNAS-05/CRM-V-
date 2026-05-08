package com.everx.security.repository;

import com.everx.security.entity.SecurityEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface SecurityEventRepository extends JpaRepository<SecurityEvent, UUID> {

    List<SecurityEvent> findByTenantId(UUID tenantId);

    List<SecurityEvent> findByTenantIdAndUserId(UUID tenantId, String userId);

    List<SecurityEvent> findByTenantIdAndEventType(UUID tenantId, String eventType);

    List<SecurityEvent> findByTenantIdAndSeverity(UUID tenantId, SecurityEvent.Severity severity);

    @Query("SELECT s FROM SecurityEvent s WHERE s.tenantId = :tenantId AND s.isResolved = false")
    List<SecurityEvent> findUnresolvedEvents(@Param("tenantId") UUID tenantId);

    @Query("SELECT s FROM SecurityEvent s WHERE s.tenantId = :tenantId AND s.requiresAction = true AND s.actionTaken = false")
    List<SecurityEvent> findPendingActionEvents(@Param("tenantId") UUID tenantId);

    @Query("SELECT s FROM SecurityEvent s WHERE s.tenantId = :tenantId AND s.severity IN :severities AND s.isResolved = false")
    List<SecurityEvent> findByTenantIdAndSeverityInAndIsResolved(@Param("tenantId") UUID tenantId, 
                                                                   @Param("severities") List<SecurityEvent.Severity> severities, 
                                                                   Boolean isResolved);

    @Query("SELECT COUNT(s) FROM SecurityEvent s WHERE s.tenantId = :tenantId")
    long countByTenantId(@Param("tenantId") UUID tenantId);

    @Query("SELECT COUNT(s) FROM SecurityEvent s WHERE s.tenantId = :tenantId AND s.severity = :severity")
    long countByTenantIdAndSeverity(@Param("tenantId") UUID tenantId, @Param("severity") SecurityEvent.Severity severity);

    @Query("SELECT s FROM SecurityEvent s WHERE s.tenantId = :tenantId AND s.timestamp BETWEEN :startDate AND :endDate")
    List<SecurityEvent> findByTenantIdAndTimestampBetween(@Param("tenantId") UUID tenantId, 
                                                           @Param("startDate") LocalDateTime startDate, 
                                                           @Param("endDate") LocalDateTime endDate);

    @Query("SELECT s FROM SecurityEvent s WHERE s.tenantId = :tenantId AND s.ipAddress = :ipAddress")
    List<SecurityEvent> findByTenantIdAndIpAddress(@Param("tenantId") UUID tenantId, @Param("ipAddress") String ipAddress);

    @Query("SELECT s FROM SecurityEvent s WHERE s.tenantId = :tenantId AND s.userAgent LIKE %:userAgent%")
    List<SecurityEvent> findByTenantIdAndUserAgentContaining(@Param("tenantId") UUID tenantId, @Param("userAgent") String userAgent);

    @Query("SELECT s FROM SecurityEvent s WHERE s.tenantId = :tenantId AND s.sourceSystem = :sourceSystem")
    List<SecurityEvent> findByTenantIdAndSourceSystem(@Param("tenantId") UUID tenantId, @Param("sourceSystem") String sourceSystem);

    @Query("SELECT s FROM SecurityEvent s WHERE s.tenantId = :tenantId AND s.escalated = true AND s.isResolved = false")
    List<SecurityEvent> findEscalatedUnresolvedEvents(@Param("tenantId") UUID tenantId);

    @Query("SELECT s FROM SecurityEvent s WHERE s.tenantId = :tenantId AND s.assignedTo = :assignedTo")
    List<SecurityEvent> findByTenantIdAndAssignedTo(@Param("tenantId") UUID tenantId, @Param("assignedTo") String assignedTo);

    @Query("SELECT s FROM SecurityEvent s WHERE s.tenantId = :tenantId AND s.threatLevel = :threatLevel")
    List<SecurityEvent> findByTenantIdAndThreatLevel(@Param("tenantId") UUID tenantId, @Param("threatLevel") String threatLevel);

    @Query("SELECT s FROM SecurityEvent s WHERE s.tenantId = :tenantId AND s.correlationId = :correlationId")
    List<SecurityEvent> findByTenantIdAndCorrelationId(@Param("tenantId") UUID tenantId, @Param("correlationId") String correlationId);

    @Query("SELECT s FROM SecurityEvent s WHERE s.tenantId = :tenantId AND s.sessionId = :sessionId")
    List<SecurityEvent> findByTenantIdAndSessionId(@Param("tenantId") UUID tenantId, @Param("sessionId") String sessionId);

    @Modifying
    @Query("DELETE FROM SecurityEvent s WHERE s.tenantId = :tenantId AND s.timestamp < :cutoffDate AND s.isResolved = true")
    int deleteOldResolvedEvents(@Param("tenantId") UUID tenantId, @Param("cutoffDate") LocalDateTime cutoffDate);

    @Query("SELECT s.severity, COUNT(s) FROM SecurityEvent s WHERE s.tenantId = :tenantId AND s.timestamp BETWEEN :startDate AND :endDate GROUP BY s.severity")
    List<Object[]> getSeverityStats(@Param("tenantId") UUID tenantId, 
                                    @Param("startDate") LocalDateTime startDate, 
                                    @Param("endDate") LocalDateTime endDate);

    @Query("SELECT s.eventType, COUNT(s) FROM SecurityEvent s WHERE s.tenantId = :tenantId AND s.timestamp BETWEEN :startDate AND :endDate GROUP BY s.eventType ORDER BY COUNT(s) DESC")
    List<Object[]> getEventTypeStats(@Param("tenantId") UUID tenantId, 
                                     @Param("startDate") LocalDateTime startDate, 
                                     @Param("endDate") LocalDateTime endDate);

    @Query("SELECT s.sourceSystem, COUNT(s) FROM SecurityEvent s WHERE s.tenantId = :tenantId AND s.timestamp BETWEEN :startDate AND :endDate GROUP BY s.sourceSystem")
    List<Object[]> getSourceSystemStats(@Param("tenantId") UUID tenantId, 
                                        @Param("startDate") LocalDateTime startDate, 
                                        @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(s) FROM SecurityEvent s WHERE s.tenantId = :tenantId AND s.severity IN :severities AND s.timestamp BETWEEN :startDate AND :endDate")
    long countByTenantIdAndSeverityInAndTimestampBetween(@Param("tenantId") UUID tenantId, 
                                                          @Param("severities") List<SecurityEvent.Severity> severities, 
                                                          @Param("startDate") LocalDateTime startDate, 
                                                          @Param("endDate") LocalDateTime endDate);

    @Query("SELECT s FROM SecurityEvent s WHERE s.tenantId = :tenantId AND s.isResolved = false ORDER BY s.timestamp DESC")
    List<SecurityEvent> findUnresolvedEventsOrderByTimestampDesc(@Param("tenantId") UUID tenantId);

    @Query("SELECT s FROM SecurityEvent s WHERE s.tenantId = :tenantId AND s.requiresAction = true ORDER BY s.timestamp DESC")
    List<SecurityEvent> findEventsRequiringActionOrderByTimestampDesc(@Param("tenantId") UUID tenantId);

    @Query("SELECT COUNT(s) FROM SecurityEvent s WHERE s.tenantId = :tenantId AND s.isResolved = true AND s.resolvedAt BETWEEN :startDate AND :endDate")
    long countResolvedEventsByPeriod(@Param("tenantId") UUID tenantId, 
                                     @Param("startDate") LocalDateTime startDate, 
                                     @Param("endDate") LocalDateTime endDate);

    @Query("SELECT AVG(s.timestamp) FROM SecurityEvent s WHERE s.tenantId = :tenantId AND s.isResolved = true AND s.timestamp BETWEEN :startDate AND :endDate")
    Double getAverageResolutionTime(@Param("tenantId") UUID tenantId, 
                                    @Param("startDate") LocalDateTime startDate, 
                                    @Param("endDate") LocalDateTime endDate);
}
