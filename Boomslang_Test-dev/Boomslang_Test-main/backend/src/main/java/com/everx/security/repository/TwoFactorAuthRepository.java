package com.everx.security.repository;

import com.everx.security.entity.TwoFactorAuth;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TwoFactorAuthRepository extends JpaRepository<TwoFactorAuth, UUID> {

    Optional<TwoFactorAuth> findByTenantIdAndUserId(UUID tenantId, String userId);

    List<TwoFactorAuth> findByTenantId(UUID tenantId);

    List<TwoFactorAuth> findByTenantIdAndIsEnabled(UUID tenantId, Boolean isEnabled);

    @Query("SELECT t FROM TwoFactorAuth t WHERE t.tenantId = :tenantId AND t.isEnabled = true AND t.lastUsedAt < :cutoffDate")
    List<TwoFactorAuth> findInactiveTwoFactorAuth(@Param("tenantId") UUID tenantId, @Param("cutoffDate") LocalDateTime cutoffDate);

    @Query("SELECT t FROM TwoFactorAuth t WHERE t.tenantId = :tenantId AND t.lockedUntil IS NOT NULL AND t.lockedUntil > :now")
    List<TwoFactorAuth> findLockedTwoFactorAuth(@Param("tenantId") UUID tenantId, @Param("now") LocalDateTime now);

    @Query("SELECT COUNT(t) FROM TwoFactorAuth t WHERE t.tenantId = :tenantId AND t.isEnabled = true")
    long countByTenantIdAndIsEnabled(@Param("tenantId") UUID tenantId, Boolean isEnabled);

    @Query("SELECT COUNT(t) FROM TwoFactorAuth t WHERE t.tenantId = :tenantId")
    long countByTenantId(@Param("tenantId") UUID tenantId);

    @Query("SELECT t FROM TwoFactorAuth t WHERE t.tenantId = :tenantId AND t.failedAttemptsCount >= :maxAttempts")
    List<TwoFactorAuth> findByTenantIdAndFailedAttemptsCountGreaterThanEqual(@Param("tenantId") UUID tenantId, @Param("maxAttempts") Integer maxAttempts);

    @Query("SELECT t FROM TwoFactorAuth t WHERE t.tenantId = :tenantId AND t.deviceTrusted = true AND t.trustExpiresAt < :now")
    List<TwoFactorAuth> findExpiredTrustDevices(@Param("tenantId") UUID tenantId, @Param("now") LocalDateTime now);

    @Query("SELECT t FROM TwoFactorAuth t WHERE t.tenantId = :tenantId AND t.method = :method")
    List<TwoFactorAuth> findByTenantIdAndMethod(@Param("tenantId") UUID tenantId, @Param("method") TwoFactorAuth.TwoFactorMethod method);

    @Query("SELECT t FROM TwoFactorAuth t WHERE t.tenantId = :tenantId AND t.backupCodesUsedCount > :maxUsage")
    List<TwoFactorAuth> findByTenantIdAndBackupCodesUsedCountGreaterThan(@Param("tenantId") UUID tenantId, @Param("maxUsage") Integer maxUsage);

    @Query("SELECT t FROM TwoFactorAuth t WHERE t.tenantId = :tenantId AND t.createdAt BETWEEN :startDate AND :endDate")
    List<TwoFactorAuth> findByTenantIdAndCreatedAtBetween(@Param("tenantId") UUID tenantId, 
                                                          @Param("startDate") LocalDateTime startDate, 
                                                          @Param("endDate") LocalDateTime endDate);

    @Query("SELECT t FROM TwoFactorAuth t WHERE t.tenantId = :tenantId AND t.verifiedAt BETWEEN :startDate AND :endDate")
    List<TwoFactorAuth> findByTenantIdAndVerifiedAtBetween(@Param("tenantId") UUID tenantId, 
                                                           @Param("startDate") LocalDateTime startDate, 
                                                           @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(t) FROM TwoFactorAuth t WHERE t.tenantId = :tenantId AND t.method = :method AND t.isEnabled = true")
    long countByTenantIdAndMethodAndIsEnabled(@Param("tenantId") UUID tenantId, 
                                             @Param("method") TwoFactorAuth.TwoFactorMethod method, 
                                             Boolean isEnabled);

    @Query("SELECT t FROM TwoFactorAuth t WHERE t.tenantId = :tenantId AND t.userId IN :userIds")
    List<TwoFactorAuth> findByTenantIdAndUserIdIn(@Param("tenantId") UUID tenantId, @Param("userIds") List<String> userIds);

    @Query("SELECT t FROM TwoFactorAuth t WHERE t.tenantId = :tenantId AND t.isEnabled = false AND t.createdAt < :cutoffDate")
    List<TwoFactorAuth> findUnverifiedTwoFactorAuth(@Param("tenantId") UUID tenantId, @Param("cutoffDate") LocalDateTime cutoffDate);
}
