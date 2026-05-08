package com.everx.security.repository;

import com.everx.security.entity.SSOConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SSOConfigRepository extends JpaRepository<SSOConfig, UUID> {

    Optional<SSOConfig> findByTenantIdAndProvider(UUID tenantId, SSOConfig.SSOProvider provider);

    List<SSOConfig> findByTenantId(UUID tenantId);

    List<SSOConfig> findByTenantIdAndIsEnabled(UUID tenantId, Boolean isEnabled);

    @Query("SELECT s FROM SSOConfig s WHERE s.tenantId = :tenantId AND s.testStatus = 'SUCCESS' AND s.lastTestedAt > :cutoffDate")
    List<SSOConfig> findHealthySSOConfigs(@Param("tenantId") UUID tenantId, @Param("cutoffDate") LocalDateTime cutoffDate);

    @Query("SELECT s FROM SSOConfig s WHERE s.tenantId = :tenantId AND s.lastErrorAt > :cutoffDate")
    List<SSOConfig> findSSOConfigsWithRecentErrors(@Param("tenantId") UUID tenantId, @Param("cutoffDate") LocalDateTime cutoffDate);

    @Query("SELECT COUNT(s) FROM SSOConfig s WHERE s.tenantId = :tenantId AND s.isEnabled = true")
    long countByTenantIdAndIsEnabled(@Param("tenantId") UUID tenantId, Boolean isEnabled);

    @Query("SELECT COUNT(s) FROM SSOConfig s WHERE s.tenantId = :tenantId")
    long countByTenantId(@Param("tenantId") UUID tenantId);

    @Query("SELECT s FROM SSOConfig s WHERE s.tenantId = :tenantId AND s.lastLoginAt < :cutoffDate")
    List<SSOConfig> findInactiveSSOConfigs(@Param("tenantId") UUID tenantId, @Param("cutoffDate") LocalDateTime cutoffDate);

    @Query("SELECT s FROM SSOConfig s WHERE s.tenantId = :tenantId AND s.provider = :provider")
    List<SSOConfig> findByTenantIdAndProvider(@Param("tenantId") UUID tenantId, @Param("provider") SSOConfig.SSOProvider provider);

    @Query("SELECT s FROM SSOConfig s WHERE s.tenantId = :tenantId AND s.errorCount > :maxErrors")
    List<SSOConfig> findByTenantIdAndErrorCountGreaterThan(@Param("tenantId") UUID tenantId, @Param("maxErrors") Long maxErrors);

    @Query("SELECT s FROM SSOConfig s WHERE s.tenantId = :tenantId AND s.loginCount > :minLogins ORDER BY s.loginCount DESC")
    List<SSOConfig> findMostUsedSSOConfigs(@Param("tenantId") UUID tenantId, @Param("minLogins") Long minLogins);

    @Query("SELECT s FROM SSOConfig s WHERE s.tenantId = :tenantId AND s.createdAt BETWEEN :startDate AND :endDate")
    List<SSOConfig> findByTenantIdAndCreatedAtBetween(@Param("tenantId") UUID tenantId, 
                                                      @Param("startDate") LocalDateTime startDate, 
                                                      @Param("endDate") LocalDateTime endDate);

    @Query("SELECT s FROM SSOConfig s WHERE s.tenantId = :tenantId AND s.lastLoginAt BETWEEN :startDate AND :endDate")
    List<SSOConfig> findByTenantIdAndLastLoginAtBetween(@Param("tenantId") UUID tenantId, 
                                                         @Param("startDate") LocalDateTime startDate, 
                                                         @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(s) FROM SSOConfig s WHERE s.tenantId = :tenantId AND s.provider = :provider AND s.isEnabled = true")
    long countByTenantIdAndProviderAndIsEnabled(@Param("tenantId") UUID tenantId, 
                                               @Param("provider") SSOConfig.SSOProvider provider, 
                                               Boolean isEnabled);

    @Query("SELECT s FROM SSOConfig s WHERE s.tenantId = :tenantId AND s.clientId = :clientId")
    Optional<SSOConfig> findByTenantIdAndClientId(@Param("tenantId") UUID tenantId, @Param("clientId") String clientId);

    @Query("SELECT s FROM SSOConfig s WHERE s.tenantId = :tenantId AND s.testStatus IS NULL OR s.lastTestedAt < :testCutoff")
    List<SSOConfig> findSSOConfigsNeedingTest(@Param("tenantId") UUID tenantId, @Param("testCutoff") LocalDateTime testCutoff);

    @Query("SELECT s FROM SSOConfig s WHERE s.tenantId = :tenantId AND (s.isEnabled = false OR s.testStatus != 'SUCCESS')")
    List<SSOConfig> findProblematicSSOConfigs(@Param("tenantId") UUID tenantId);

    @Query("SELECT SUM(s.loginCount) FROM SSOConfig s WHERE s.tenantId = :tenantId")
    Long getTotalLoginCount(@Param("tenantId") UUID tenantId);

    @Query("SELECT SUM(s.errorCount) FROM SSOConfig s WHERE s.tenantId = :tenantId")
    Long getTotalErrorCount(@Param("tenantId") UUID tenantId);
}
