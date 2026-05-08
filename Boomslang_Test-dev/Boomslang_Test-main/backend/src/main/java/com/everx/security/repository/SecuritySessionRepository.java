package com.everx.security.repository;

import com.everx.security.entity.SecuritySession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SecuritySessionRepository extends JpaRepository<SecuritySession, UUID> {

    Optional<SecuritySession> findByTenantIdAndSessionToken(UUID tenantId, String sessionToken);

    Optional<SecuritySession> findBySessionToken(String sessionToken);

    List<SecuritySession> findByTenantId(UUID tenantId);

    List<SecuritySession> findByTenantIdAndUserId(UUID tenantId, String userId);

    List<SecuritySession> findByTenantIdAndIsActive(UUID tenantId, Boolean isActive);

    @Query("SELECT s FROM SecuritySession s WHERE s.tenantId = :tenantId AND s.isActive = true AND s.expiresAt < :now")
    List<SecuritySession> findByTenantIdAndIsActiveAndExpiresAtBefore(@Param("tenantId") UUID tenantId, 
                                                                        @Param("now") LocalDateTime now);

    @Query("SELECT s FROM SecuritySession s WHERE s.tenantId = :tenantId AND s.isActive = true AND s.lastActivityAt < :cutoffDate")
    List<SecuritySession> findInactiveSessions(@Param("tenantId") UUID tenantId, @Param("cutoffDate") LocalDateTime cutoffDate);

    @Query("SELECT COUNT(s) FROM SecuritySession s WHERE s.tenantId = :tenantId AND s.isActive = true")
    long countByTenantIdAndIsActive(@Param("tenantId") UUID tenantId, Boolean isActive);

    @Query("SELECT COUNT(s) FROM SecuritySession s WHERE s.tenantId = :tenantId")
    long countByTenantId(@Param("tenantId") UUID tenantId);

    @Query("SELECT s FROM SecuritySession s WHERE s.tenantId = :tenantId AND s.userId = :userId AND s.isActive = true")
    List<SecuritySession> findActiveSessionsByUser(@Param("tenantId") UUID tenantId, @Param("userId") String userId);

    @Query("SELECT s FROM SecuritySession s WHERE s.tenantId = :tenantId AND s.sessionType = :sessionType")
    List<SecuritySession> findByTenantIdAndSessionType(@Param("tenantId") UUID tenantId, @Param("sessionType") SecuritySession.SessionType sessionType);

    @Query("SELECT s FROM SecuritySession s WHERE s.tenantId = :tenantId AND s.ipAddress = :ipAddress")
    List<SecuritySession> findByTenantIdAndIpAddress(@Param("tenantId") UUID tenantId, @Param("ipAddress") String ipAddress);

    @Query("SELECT s FROM SecuritySession s WHERE s.tenantId = :tenantId AND s.riskScore > :threshold")
    List<SecuritySession> findByTenantIdAndRiskScoreGreaterThan(@Param("tenantId") UUID tenantId, @Param("threshold") Double threshold);

    @Query("SELECT s FROM SecuritySession s WHERE s.tenantId = :tenantId AND s.anomalyDetected = true")
    List<SecuritySession> findByTenantIdAndAnomalyDetected(@Param("tenantId") UUID tenantId);

    @Query("SELECT s FROM SecuritySession s WHERE s.tenantId = :tenantId AND s.revokedAt IS NOT NULL ORDER BY s.revokedAt DESC")
    List<SecuritySession> findRevokedSessions(@Param("tenantId") UUID tenantId);

    @Query("SELECT s FROM SecuritySession s WHERE s.tenantId = :tenantId AND s.mfaVerified = false AND s.isActive = true")
    List<SecuritySession> findSessionsRequiringMFA(@Param("tenantId") UUID tenantId);

    @Query("SELECT s FROM SecuritySession s WHERE s.tenantId = :tenantId AND s.createdAt BETWEEN :startDate AND :endDate")
    List<SecuritySession> findByTenantIdAndCreatedAtBetween(@Param("tenantId") UUID tenantId, 
                                                             @Param("startDate") LocalDateTime startDate, 
                                                             @Param("endDate") LocalDateTime endDate);

    @Query("SELECT s FROM SecuritySession s WHERE s.tenantId = :tenantId AND s.lastActivityAt BETWEEN :startDate AND :endDate")
    List<SecuritySession> findByTenantIdAndLastActivityAtBetween(@Param("tenantId") UUID tenantId, 
                                                                  @Param("startDate") LocalDateTime startDate, 
                                                                  @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(s) FROM SecuritySession s WHERE s.tenantId = :tenantId AND s.sessionType = :sessionType AND s.isActive = true")
    long countByTenantIdAndSessionTypeAndIsActive(@Param("tenantId") UUID tenantId, 
                                                  @Param("sessionType") SecuritySession.SessionType sessionType, 
                                                  Boolean isActive);

    @Query("SELECT s FROM SecuritySession s WHERE s.tenantId = :tenantId AND s.deviceFingerprint = :deviceFingerprint")
    List<SecuritySession> findByTenantIdAndDeviceFingerprint(@Param("tenantId") UUID tenantId, @Param("deviceFingerprint") String deviceFingerprint);

    @Query("SELECT s FROM SecuritySession s WHERE s.tenantId = :tenantId AND s.userAgent LIKE %:userAgent%")
    List<SecuritySession> findByTenantIdAndUserAgentContaining(@Param("tenantId") UUID tenantId, @Param("userAgent") String userAgent);

    @Modifying
    @Query("DELETE FROM SecuritySession s WHERE s.tenantId = :tenantId AND s.expiresAt < :cutoffDate")
    int deleteExpiredSessions(@Param("tenantId") UUID tenantId, @Param("cutoffDate") LocalDateTime cutoffDate);

    @Modifying
    @Query("UPDATE SecuritySession s SET s.isActive = false WHERE s.tenantId = :tenantId AND s.userId = :userId AND s.id != :currentSessionId")
    int revokeOtherSessionsForUser(@Param("tenantId") UUID tenantId, @Param("userId") String userId, @Param("currentSessionId") UUID currentSessionId);

    @Query("SELECT COUNT(DISTINCT s.userId) FROM SecuritySession s WHERE s.tenantId = :tenantId AND s.isActive = true")
    long countActiveUsers(@Param("tenantId") UUID tenantId);

    @Query("SELECT s.sessionType, COUNT(s) FROM SecuritySession s WHERE s.tenantId = :tenantId AND s.isActive = true GROUP BY s.sessionType")
    List<Object[]> getSessionTypeStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT s FROM SecuritySession s WHERE s.tenantId = :tenantId AND s.location = :location")
    List<SecuritySession> findByTenantIdAndLocation(@Param("tenantId") UUID tenantId, @Param("location") String location);
}
