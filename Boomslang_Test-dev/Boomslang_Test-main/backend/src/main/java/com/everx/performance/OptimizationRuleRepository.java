package com.everx.performance.repository;

import com.everx.performance.entity.OptimizationRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface OptimizationRuleRepository extends JpaRepository<OptimizationRule, UUID> {

    List<OptimizationRule> findByTenantId(UUID tenantId);

    List<OptimizationRule> findByTenantIdAndIsEnabled(UUID tenantId, Boolean isEnabled);

    List<OptimizationRule> findByTenantIdAndRuleType(UUID tenantId, OptimizationRule.RuleType ruleType);

    @Query("SELECT r FROM OptimizationRule r WHERE r.tenantId = :tenantId AND r.isEnabled = true ORDER BY r.priority DESC")
    List<OptimizationRule> findByTenantIdAndIsEnabledOrderByPriorityDesc(@Param("tenantId") UUID tenantId);

    @Query("SELECT COUNT(r) FROM OptimizationRule r WHERE r.tenantId = :tenantId AND r.isEnabled = true")
    long countByTenantIdAndIsEnabled(@Param("tenantId") UUID tenantId, Boolean isEnabled);

    @Query("SELECT COUNT(r) FROM OptimizationRule r WHERE r.tenantId = :tenantId")
    long countByTenantId(@Param("tenantId") UUID tenantId);

    @Query("SELECT r FROM OptimizationRule r WHERE r.tenantId = :tenantId AND r.canBeApplied = true")
    List<OptimizationRule> findApplicableRules(@Param("tenantId") UUID tenantId);

    @Query("SELECT r FROM OptimizationRule r WHERE r.tenantId = :tenantId AND r.canAutoApply = true")
    List<OptimizationRule> findAutoApplicableRules(@Param("tenantId") UUID tenantId);

    @Query("SELECT r FROM OptimizationRule r WHERE r.tenantId = :tenantId AND r.isInCooldown = false")
    List<OptimizationRule> findRulesNotInCooldown(@Param("tenantId") UUID tenantId);

    @Query("SELECT r FROM OptimizationRule r WHERE r.tenantId = :tenantId AND r.hasReachedMaxApplications = false")
    List<OptimizationRule> findRulesNotAtMaxApplications(@Param("tenantId") UUID tenantId);

    @Query("SELECT r FROM OptimizationRule r WHERE r.tenantId = :tenantId AND r.createdBy = :createdBy")
    List<OptimizationRule> findByTenantIdAndCreatedBy(@Param("tenantId") UUID tenantId, @Param("createdBy") String createdBy);

    @Query("SELECT r FROM OptimizationRule r WHERE r.tenantId = :tenantId AND r.lastAppliedAt BETWEEN :startDate AND :endDate")
    List<OptimizationRule> findByTenantIdAndLastAppliedAtBetween(@Param("tenantId") UUID tenantId, 
                                                                  @Param("startDate") LocalDateTime startDate, 
                                                                  @Param("endDate") LocalDateTime endDate);

    @Query("SELECT r FROM OptimizationRule r WHERE r.tenantId = :tenantId AND r.category = :category")
    List<OptimizationRule> findByTenantIdAndCategory(@Param("tenantId") UUID tenantId, @Param("category") String category);

    @Query("SELECT r FROM OptimizationRule r WHERE r.tenantId = :tenantId AND r.priority >= :minPriority ORDER BY r.priority DESC")
    List<OptimizationRule> findByTenantIdAndPriorityGreaterThanEqualOrderByPriorityDesc(@Param("tenantId") UUID tenantId, 
                                                                                         @Param("minPriority") Integer minPriority);

    @Query("SELECT r FROM OptimizationRule r WHERE r.tenantId = :tenantId AND r.isSystemRule = true")
    List<OptimizationRule> findSystemRules(@Param("tenantId") UUID tenantId);

    @Query("SELECT r FROM OptimizationRule r WHERE r.tenantId = :tenantId AND r.needsApproval = true")
    List<OptimizationRule> findRulesNeedingApproval(@Param("tenantId") UUID tenantId);

    @Query("SELECT r FROM OptimizationRule r WHERE r.tenantId = :tenantId AND r.isBelowSuccessThreshold = true")
    List<OptimizationRule> findRulesBelowSuccessThreshold(@Param("tenantId") UUID tenantId);

    @Query("SELECT AVG(r.successRate) FROM OptimizationRule r WHERE r.tenantId = :tenantId AND r.applicationCount > 0")
    Double getAverageSuccessRate(@Param("tenantId") UUID tenantId);

    @Query("SELECT r.ruleType, COUNT(r) FROM OptimizationRule r WHERE r.tenantId = :tenantId GROUP BY r.ruleType")
    List<Object[]> getRuleTypeStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT r.status, COUNT(r) FROM OptimizationRule r WHERE r.tenantId = :tenantId GROUP BY r.status")
    List<Object[]> getStatusStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT r.category, COUNT(r) FROM OptimizationRule r WHERE r.tenantId = :tenantId AND r.category IS NOT NULL GROUP BY r.category")
    List<Object[]> getCategoryStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT SUM(r.applicationCount) FROM OptimizationRule r WHERE r.tenantId = :tenantId")
    Long getTotalApplicationCount(@Param("tenantId") UUID tenantId);

    @Query("SELECT SUM(r.successCount) FROM OptimizationRule r WHERE r.tenantId = :tenantId")
    Long getTotalSuccessCount(@Param("tenantId") UUID tenantId);

    @Query("SELECT SUM(r.failureCount) FROM OptimizationRule r WHERE r.tenantId = :tenantId")
    Long getTotalFailureCount(@Param("tenantId") UUID tenantId);

    @Query("SELECT r FROM OptimizationRule r WHERE r.tenantId = :tenantId AND r.name LIKE %:name%")
    List<OptimizationRule> findByTenantIdAndNameContaining(@Param("tenantId") UUID tenantId, @Param("name") String name);

    @Query("SELECT r FROM OptimizationRule r WHERE r.tenantId = :tenantId AND r.hasConditions = true")
    List<OptimizationRule> findRulesWithConditions(@Param("tenantId") UUID tenantId);

    @Query("SELECT r FROM OptimizationRule r WHERE r.tenantId = :tenantId AND r.hasActions = true")
    List<OptimizationRule> findRulesWithActions(@Param("tenantId") UUID tenantId);

    @Query("SELECT r FROM OptimizationRule r WHERE r.tenantId = :tenantId AND r.version > :minVersion")
    List<OptimizationRule> findByTenantIdAndVersionGreaterThan(@Param("tenantId") UUID tenantId, @Param("minVersion") Integer minVersion);

    @Query("SELECT r FROM OptimizationRule r WHERE r.tenantId = :tenantId AND r.lastApplicationAttemptAt < :cutoffDate AND r.canBeApplied = true")
    List<OptimizationRule> findRulesNeedingApplication(@Param("tenantId") UUID tenantId, @Param("cutoffDate") LocalDateTime cutoffDate);

    @Query("SELECT COUNT(r) FROM OptimizationRule r WHERE r.tenantId = :tenantId AND r.ruleType = :ruleType AND r.isEnabled = true")
    long countByTenantIdAndRuleTypeAndIsEnabled(@Param("tenantId") UUID tenantId, 
                                               @Param("ruleType") OptimizationRule.RuleType ruleType, 
                                               Boolean isEnabled);

    @Query("SELECT r FROM OptimizationRule r WHERE r.tenantId = :tenantId AND r.approvedAt IS NULL AND r.needsApproval = true")
    List<OptimizationRule> findUnapprovedRules(@Param("tenantId") UUID tenantId);
}
