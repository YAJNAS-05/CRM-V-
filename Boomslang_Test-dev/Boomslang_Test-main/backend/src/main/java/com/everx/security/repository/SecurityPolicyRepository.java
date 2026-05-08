package com.everx.security.repository;

import com.everx.security.entity.SecurityPolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface SecurityPolicyRepository extends JpaRepository<SecurityPolicy, UUID> {

    List<SecurityPolicy> findByTenantId(UUID tenantId);

    List<SecurityPolicy> findByTenantIdAndIsEnabled(UUID tenantId, Boolean isEnabled);

    List<SecurityPolicy> findByTenantIdAndPolicyType(UUID tenantId, SecurityPolicy.PolicyType policyType);

    List<SecurityPolicy> findByTenantIdAndEnforcementLevel(UUID tenantId, SecurityPolicy.EnforcementLevel enforcementLevel);

    @Query("SELECT s FROM SecurityPolicy s WHERE s.tenantId = :tenantId AND s.isEnabled = true ORDER BY s.priority DESC")
    List<SecurityPolicy> findByTenantIdAndIsEnabledOrderByPriorityDesc(@Param("tenantId") UUID tenantId);

    @Query("SELECT s FROM SecurityPolicy s WHERE s.tenantId = :tenantId AND s.policyType = :policyType AND s.isEnabled = true")
    List<SecurityPolicy> findByTenantIdAndPolicyTypeAndIsEnabled(@Param("tenantId") UUID tenantId, 
                                                                @Param("policyType") SecurityPolicy.PolicyType policyType, 
                                                                Boolean isEnabled);

    @Query("SELECT COUNT(s) FROM SecurityPolicy s WHERE s.tenantId = :tenantId AND s.isEnabled = true")
    long countByTenantIdAndIsEnabled(@Param("tenantId") UUID tenantId, Boolean isEnabled);

    @Query("SELECT COUNT(s) FROM SecurityPolicy s WHERE s.tenantId = :tenantId")
    long countByTenantId(@Param("tenantId") UUID tenantId);

    @Query("SELECT s FROM SecurityPolicy s WHERE s.tenantId = :tenantId AND s.violationCount > :maxViolations")
    List<SecurityPolicy> findByTenantIdAndViolationCountGreaterThan(@Param("tenantId") UUID tenantId, @Param("maxViolations") Long maxViolations);

    @Query("SELECT s FROM SecurityPolicy s WHERE s.tenantId = :tenantId AND s.lastViolationAt > :cutoffDate")
    List<SecurityPolicy> findByTenantIdAndLastViolationAtAfter(@Param("tenantId") UUID tenantId, @Param("cutoffDate") LocalDateTime cutoffDate);

    @Query("SELECT s FROM SecurityPolicy s WHERE s.tenantId = :tenantId AND s.enforcementLevel IN :levels")
    List<SecurityPolicy> findByTenantIdAndEnforcementLevelIn(@Param("tenantId") UUID tenantId, 
                                                              @Param("levels") List<SecurityPolicy.EnforcementLevel> levels);

    @Query("SELECT s FROM SecurityPolicy s WHERE s.tenantId = :tenantId AND s.complianceFramework = :framework")
    List<SecurityPolicy> findByTenantIdAndComplianceFramework(@Param("tenantId") UUID tenantId, @Param("framework") String framework);

    @Query("SELECT s FROM SecurityPolicy s WHERE s.tenantId = :tenantId AND s.autoBlockEnabled = true AND s.isEnabled = true")
    List<SecurityPolicy> findAutoBlockPolicies(@Param("tenantId") UUID tenantId);

    @Query("SELECT s FROM SecurityPolicy s WHERE s.tenantId = :tenantId AND s.notificationEnabled = true AND s.isEnabled = true")
    List<SecurityPolicy> findNotificationPolicies(@Param("tenantId") UUID tenantId);

    @Query("SELECT s FROM SecurityPolicy s WHERE s.tenantId = :tenantId AND s.createdAt BETWEEN :startDate AND :endDate")
    List<SecurityPolicy> findByTenantIdAndCreatedAtBetween(@Param("tenantId") UUID tenantId, 
                                                           @Param("startDate") LocalDateTime startDate, 
                                                           @Param("endDate") LocalDateTime endDate);

    @Query("SELECT s FROM SecurityPolicy s WHERE s.tenantId = :tenantId AND s.updatedAt BETWEEN :startDate AND :endDate")
    List<SecurityPolicy> findByTenantIdAndUpdatedAtBetween(@Param("tenantId") UUID tenantId, 
                                                          @Param("startDate") LocalDateTime startDate, 
                                                          @Param("endDate") LocalDateTime endDate);

    @Query("SELECT s FROM SecurityPolicy s WHERE s.tenantId = :tenantId AND s.priority >= :minPriority ORDER BY s.priority DESC")
    List<SecurityPolicy> findByTenantIdAndPriorityGreaterThanEqualOrderByPriorityDesc(@Param("tenantId") UUID tenantId, 
                                                                                       @Param("minPriority") Integer minPriority);

    @Query("SELECT COUNT(s) FROM SecurityPolicy s WHERE s.tenantId = :tenantId AND s.policyType = :policyType AND s.isEnabled = true")
    long countByTenantIdAndPolicyTypeAndIsEnabled(@Param("tenantId") UUID tenantId, 
                                                  @Param("policyType") SecurityPolicy.PolicyType policyType, 
                                                  Boolean isEnabled);

    @Query("SELECT s FROM SecurityPolicy s WHERE s.tenantId = :tenantId AND s.createdBy = :createdBy")
    List<SecurityPolicy> findByTenantIdAndCreatedBy(@Param("tenantId") UUID tenantId, @Param("createdBy") String createdBy);

    @Query("SELECT s FROM SecurityPolicy s WHERE s.tenantId = :tenantId AND s.riskScoreThreshold IS NOT NULL")
    List<SecurityPolicy> findByTenantIdAndRiskScoreThresholdIsNotNull(@Param("tenantId") UUID tenantId);

    @Query("SELECT s FROM SecurityPolicy s WHERE s.tenantId = :tenantId AND s.version > :minVersion")
    List<SecurityPolicy> findByTenantIdAndVersionGreaterThan(@Param("tenantId") UUID tenantId, @Param("minVersion") Integer minVersion);

    @Query("SELECT s.policyType, COUNT(s) FROM SecurityPolicy s WHERE s.tenantId = :tenantId AND s.isEnabled = true GROUP BY s.policyType")
    List<Object[]> getPolicyTypeStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT s.enforcementLevel, COUNT(s) FROM SecurityPolicy s WHERE s.tenantId = :tenantId AND s.isEnabled = true GROUP BY s.enforcementLevel")
    List<Object[]> getEnforcementLevelStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT s.complianceFramework, COUNT(s) FROM SecurityPolicy s WHERE s.tenantId = :tenantId AND s.complianceFramework IS NOT NULL GROUP BY s.complianceFramework")
    List<Object[]> getComplianceFrameworkStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT s FROM SecurityPolicy s WHERE s.tenantId = :tenantId AND s.name LIKE %:name%")
    List<SecurityPolicy> findByTenantIdAndNameContaining(@Param("tenantId") UUID tenantId, @Param("name") String name);

    @Query("SELECT s FROM SecurityPolicy s WHERE s.tenantId = :tenantId AND (s.violationCount IS NULL OR s.violationCount = 0) AND s.isEnabled = true")
    List<SecurityPolicy> findPoliciesWithNoViolations(@Param("tenantId") UUID tenantId);

    @Query("SELECT MAX(s.version) FROM SecurityPolicy s WHERE s.tenantId = :tenantId AND s.name = :name")
    Integer findMaxVersionByName(@Param("tenantId") UUID tenantId, @Param("name") String name);

    @Query("SELECT s FROM SecurityPolicy s WHERE s.tenantId = :tenantId AND s.gracePeriodMinutes > 0 AND s.isEnabled = true")
    List<SecurityPolicy> findPoliciesWithGracePeriod(@Param("tenantId") UUID tenantId);

    @Query("SELECT s FROM SecurityPolicy s WHERE s.tenantId = :tenantId AND s.cooldownPeriodMinutes > 0 AND s.isEnabled = true")
    List<SecurityPolicy> findPoliciesWithCooldownPeriod(@Param("tenantId") UUID tenantId);
}
