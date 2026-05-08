package com.everx.performance.repository;

import com.everx.performance.entity.CacheOptimization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface CacheOptimizationRepository extends JpaRepository<CacheOptimization, UUID> {

    List<CacheOptimization> findByTenantId(UUID tenantId);

    List<CacheOptimization> findByTenantIdAndStatus(UUID tenantId, CacheOptimization.Status status);

    @Query("SELECT COUNT(o) FROM CacheOptimization o WHERE o.tenantId = :tenantId AND o.status = :status")
    long countByTenantIdAndStatus(@Param("tenantId") UUID tenantId, @Param("status") CacheOptimization.Status status);

    @Query("SELECT COUNT(o) FROM CacheOptimization o WHERE o.tenantId = :tenantId")
    long countByTenantId(@Param("tenantId") UUID tenantId);

    @Query("SELECT o FROM CacheOptimization o WHERE o.tenantId = :tenantId AND o.cacheType = :cacheType")
    List<CacheOptimization> findByTenantIdAndCacheType(@Param("tenantId") UUID tenantId, @Param("cacheType") String cacheType);

    @Query("SELECT o FROM CacheOptimization o WHERE o.tenantId = :tenantId AND o.optimizationType = :optimizationType")
    List<CacheOptimization> findByTenantIdAndOptimizationType(@Param("tenantId") UUID tenantId, @Param("optimizationType") String optimizationType);

    @Query("SELECT o FROM CacheOptimization o WHERE o.tenantId = :tenantId AND o.createdBy = :createdBy")
    List<CacheOptimization> findByTenantIdAndCreatedBy(@Param("tenantId") UUID tenantId, @Param("createdBy") String createdBy);

    @Query("SELECT o FROM CacheOptimization o WHERE o.tenantId = :tenantId AND o.isApplied = true")
    List<CacheOptimization> findAppliedOptimizations(@Param("tenantId") UUID tenantId);

    @Query("SELECT o FROM CacheOptimization o WHERE o.tenantId = :tenantId AND o.isRolledBack = true")
    List<CacheOptimization> findRolledBackOptimizations(@Param("tenantId") UUID tenantId);

    @Query("SELECT o FROM CacheOptimization o WHERE o.tenantId = :tenantId AND o.canRollback = true")
    List<CacheOptimization> findOptimizationsThatCanRollback(@Param("tenantId") UUID tenantId);

    @Query("SELECT o FROM CacheOptimization o WHERE o.tenantId = :tenantId AND o.hasSignificantImprovement = true")
    List<CacheOptimization> findOptimizationsWithSignificantImprovement(@Param("tenantId") UUID tenantId);

    @Query("SELECT o FROM CacheOptimization o WHERE o.tenantId = :tenantId AND o.hasMemorySavings = true")
    List<CacheOptimization> findOptimizationsWithMemorySavings(@Param("tenantId") UUID tenantId);

    @Query("SELECT o FROM CacheOptimization o WHERE o.tenantId = :tenantId AND o.hasLatencyImprovement = true")
    List<CacheOptimization> findOptimizationsWithLatencyImprovement(@Param("tenantId") UUID tenantId);

    @Query("SELECT o FROM CacheOptimization o WHERE o.tenantId = :tenantId AND o.isAutomated = true")
    List<CacheOptimization> findAutomatedOptimizations(@Param("tenantId") UUID tenantId);

    @Query("SELECT o FROM CacheOptimization o WHERE o.tenantId = :tenantId AND o.priority >= :minPriority ORDER BY o.priority DESC")
    List<CacheOptimization> findByTenantIdAndPriorityGreaterThanEqualOrderByPriorityDesc(@Param("tenantId") UUID tenantId, 
                                                                                         @Param("minPriority") Integer minPriority);

    @Query("SELECT o FROM CacheOptimization o WHERE o.tenantId = :tenantId AND o.completedAt BETWEEN :startDate AND :endDate")
    List<CacheOptimization> findByTenantIdAndCompletedAtBetween(@Param("tenantId") UUID tenantId, 
                                                                @Param("startDate") LocalDateTime startDate, 
                                                                @Param("endDate") LocalDateTime endDate);

    @Query("SELECT o FROM CacheOptimization o WHERE o.tenantId = :tenantId AND o.appliedAt BETWEEN :startDate AND :endDate")
    List<CacheOptimization> findByTenantIdAndAppliedAtBetween(@Param("tenantId") UUID tenantId, 
                                                              @Param("startDate") LocalDateTime startDate, 
                                                              @Param("endDate") LocalDateTime endDate);

    @Query("SELECT AVG(o.performanceImprovement) FROM CacheOptimization o WHERE o.tenantId = :tenantId AND o.performanceImprovement IS NOT NULL")
    Double getAveragePerformanceImprovement(@Param("tenantId") UUID tenantId);

    @Query("SELECT SUM(o.memorySavedMb) FROM CacheOptimization o WHERE o.tenantId = :tenantId AND o.memorySavedMb IS NOT NULL")
    Double getTotalMemorySaved(@Param("tenantId") UUID tenantId);

    @Query("SELECT AVG(o.latencyReductionMs) FROM CacheOptimization o WHERE o.tenantId = :tenantId AND o.latencyReductionMs IS NOT NULL")
    Double getAverageLatencyReduction(@Param("tenantId") UUID tenantId);

    @Query("SELECT o.status, COUNT(o) FROM CacheOptimization o WHERE o.tenantId = :tenantId GROUP BY o.status")
    List<Object[]> getStatusStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT o.cacheType, COUNT(o) FROM CacheOptimization o WHERE o.tenantId = :tenantId AND o.cacheType IS NOT NULL GROUP BY o.cacheType")
    List<Object[]> getCacheTypeStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT o.optimizationType, COUNT(o) FROM CacheOptimization o WHERE o.tenantId = :tenantId AND o.optimizationType IS NOT NULL GROUP BY o.optimizationType")
    List<Object[]> getOptimizationTypeStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT SUM(o.costSavings) FROM CacheOptimization o WHERE o.tenantId = :tenantId AND o.costSavings IS NOT NULL")
    Double getTotalCostSavings(@Param("tenantId") UUID tenantId);

    @Query("SELECT o FROM CacheOptimization o WHERE o.tenantId = :tenantId AND o.name LIKE %:name%")
    List<CacheOptimization> findByTenantIdAndNameContaining(@Param("tenantId") UUID tenantId, @Param("name") String name);

    @Query("SELECT o FROM CacheOptimization o WHERE o.tenantId = :tenantId AND o.category = :category")
    List<CacheOptimization> findByTenantIdAndCategory(@Param("tenantId") UUID tenantId, @Param("category") String category);

    @Query("SELECT COUNT(o) FROM CacheOptimization o WHERE o.tenantId = :tenantId AND o.cacheType = :cacheType AND o.status = :status")
    long countByTenantIdAndCacheTypeAndStatus(@Param("tenantId") UUID tenantId, 
                                             @Param("cacheType") String cacheType, 
                                             @Param("status") CacheOptimization.Status status);

    @Query("SELECT o FROM CacheOptimization o WHERE o.tenantId = :tenantId AND o.actualDurationMinutes > :maxDuration")
    List<CacheOptimization> findByTenantIdAndActualDurationMinutesGreaterThan(@Param("tenantId") UUID tenantId, @Param("maxDuration") Double maxDuration);

    @Query("SELECT o FROM CacheOptimization o WHERE o.tenantId = :tenantId AND o.estimatedDurationMinutes > :maxEstimatedDuration")
    List<CacheOptimization> findByTenantIdAndEstimatedDurationMinutesGreaterThan(@Param("tenantId") UUID tenantId, @Param("maxEstimatedDuration") Integer maxEstimatedDuration);
}
