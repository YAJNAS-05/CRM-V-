package com.everx.performance.repository;

import com.everx.performance.entity.DatabaseOptimization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface DatabaseOptimizationRepository extends JpaRepository<DatabaseOptimization, UUID> {

    List<DatabaseOptimization> findByTenantId(UUID tenantId);

    List<DatabaseOptimization> findByTenantIdAndStatus(UUID tenantId, DatabaseOptimization.Status status);

    @Query("SELECT COUNT(o) FROM DatabaseOptimization o WHERE o.tenantId = :tenantId AND o.status = :status")
    long countByTenantIdAndStatus(@Param("tenantId") UUID tenantId, @Param("status") DatabaseOptimization.Status status);

    @Query("SELECT COUNT(o) FROM DatabaseOptimization o WHERE o.tenantId = :tenantId")
    long countByTenantId(@Param("tenantId") UUID tenantId);

    @Query("SELECT o FROM DatabaseOptimization o WHERE o.tenantId = :tenantId AND o.databaseType = :databaseType")
    List<DatabaseOptimization> findByTenantIdAndDatabaseType(@Param("tenantId") UUID tenantId, @Param("databaseType") String databaseType);

    @Query("SELECT o FROM DatabaseOptimization o WHERE o.tenantId = :tenantId AND o.databaseName = :databaseName")
    List<DatabaseOptimization> findByTenantIdAndDatabaseName(@Param("tenantId") UUID tenantId, @Param("databaseName") String databaseName);

    @Query("SELECT o FROM DatabaseOptimization o WHERE o.tenantId = :tenantId AND o.optimizationType = :optimizationType")
    List<DatabaseOptimization> findByTenantIdAndOptimizationType(@Param("tenantId") UUID tenantId, @Param("optimizationType") String optimizationType);

    @Query("SELECT o FROM DatabaseOptimization o WHERE o.tenantId = :tenantId AND o.createdBy = :createdBy")
    List<DatabaseOptimization> findByTenantIdAndCreatedBy(@Param("tenantId") UUID tenantId, @Param("createdBy") String createdBy);

    @Query("SELECT o FROM DatabaseOptimization o WHERE o.tenantId = :tenantId AND o.isApplied = true")
    List<DatabaseOptimization> findAppliedOptimizations(@Param("tenantId") UUID tenantId);

    @Query("SELECT o FROM DatabaseOptimization o WHERE o.tenantId = :tenantId AND o.isRolledBack = true")
    List<DatabaseOptimization> findRolledBackOptimizations(@Param("tenantId") UUID tenantId);

    @Query("SELECT o FROM DatabaseOptimization o WHERE o.tenantId = :tenantId AND o.canRollback = true")
    List<DatabaseOptimization> findOptimizationsThatCanRollback(@Param("tenantId") UUID tenantId);

    @Query("SELECT o FROM DatabaseOptimization o WHERE o.tenantId = :tenantId AND o.hasSignificantImprovement = true")
    List<DatabaseOptimization> findOptimizationsWithSignificantImprovement(@Param("tenantId") UUID tenantId);

    @Query("SELECT o FROM DatabaseOptimization o WHERE o.tenantId = :tenantId AND o.hasQueryTimeImprovement = true")
    List<DatabaseOptimization> findOptimizationsWithQueryTimeImprovement(@Param("tenantId") UUID tenantId);

    @Query("SELECT o FROM DatabaseOptimization o WHERE o.tenantId = :tenantId AND o.hasStorageSavings = true")
    List<DatabaseOptimization> findOptimizationsWithStorageSavings(@Param("tenantId") UUID tenantId);

    @Query("SELECT o FROM DatabaseOptimization o WHERE o.tenantId = :tenantId AND o.requiresMaintenanceWindow = true")
    List<DatabaseOptimization> findOptimizationsRequiringMaintenanceWindow(@Param("tenantId") UUID tenantId);

    @Query("SELECT o FROM DatabaseOptimization o WHERE o.tenantId = :tenantId AND o.isInMaintenanceWindow = true")
    List<DatabaseOptimization> findOptimizationsInMaintenanceWindow(@Param("tenantId") UUID tenantId);

    @Query("SELECT o FROM DatabaseOptimization o WHERE o.tenantId = :tenantId AND o.isHighRisk = true")
    List<DatabaseOptimization> findHighRiskOptimizations(@Param("tenantId") UUID tenantId);

    @Query("SELECT o FROM DatabaseOptimization o WHERE o.tenantId = :tenantId AND o.requiresBackup = true")
    List<DatabaseOptimization> findOptimizationsRequiringBackup(@Param("tenantId") UUID tenantId);

    @Query("SELECT o FROM DatabaseOptimization o WHERE o.tenantId = :tenantId AND o.hasBackup = true")
    List<DatabaseOptimization> findOptimizationsWithBackup(@Param("tenantId") UUID tenantId);

    @Query("SELECT o FROM DatabaseOptimization o WHERE o.tenantId = :tenantId AND o.isAutomated = true")
    List<DatabaseOptimization> findAutomatedOptimizations(@Param("tenantId") UUID tenantId);

    @Query("SELECT o FROM DatabaseOptimization o WHERE o.tenantId = :tenantId AND o.priority >= :minPriority ORDER BY o.priority DESC")
    List<DatabaseOptimization> findByTenantIdAndPriorityGreaterThanEqualOrderByPriorityDesc(@Param("tenantId") UUID tenantId, 
                                                                                         @Param("minPriority") Integer minPriority);

    @Query("SELECT o FROM DatabaseOptimization o WHERE o.tenantId = :tenantId AND o.completedAt BETWEEN :startDate AND :endDate")
    List<DatabaseOptimization> findByTenantIdAndCompletedAtBetween(@Param("tenantId") UUID tenantId, 
                                                                  @Param("startDate") LocalDateTime startDate, 
                                                                  @Param("endDate") LocalDateTime endDate);

    @Query("SELECT o FROM DatabaseOptimization o WHERE o.tenantId = :tenantId AND o.appliedAt BETWEEN :startDate AND :endDate")
    List<DatabaseOptimization> findByTenantIdAndAppliedAtBetween(@Param("tenantId") UUID tenantId, 
                                                                @Param("startDate") LocalDateTime startDate, 
                                                                @Param("endDate") LocalDateTime endDate);

    @Query("SELECT AVG(o.performanceImprovement) FROM DatabaseOptimization o WHERE o.tenantId = :tenantId AND o.performanceImprovement IS NOT NULL")
    Double getAveragePerformanceImprovement(@Param("tenantId") UUID tenantId);

    @Query("SELECT SUM(o.storageSavedMb) FROM DatabaseOptimization o WHERE o.tenantId = :tenantId AND o.storageSavedMb IS NOT NULL")
    Double getTotalStorageSaved(@Param("tenantId") UUID tenantId);

    @Query("SELECT AVG(o.queryTimeReductionMs) FROM DatabaseOptimization o WHERE o.tenantId = :tenantId AND o.queryTimeReductionMs IS NOT NULL")
    Double getAverageQueryTimeReduction(@Param("tenantId") UUID tenantId);

    @Query("SELECT o.status, COUNT(o) FROM DatabaseOptimization o WHERE o.tenantId = :tenantId GROUP BY o.status")
    List<Object[]> getStatusStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT o.databaseType, COUNT(o) FROM DatabaseOptimization o WHERE o.tenantId = :tenantId AND o.databaseType IS NOT NULL GROUP BY o.databaseType")
    List<Object[]> getDatabaseTypeStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT o.optimizationType, COUNT(o) FROM DatabaseOptimization o WHERE o.tenantId = :tenantId AND o.optimizationType IS NOT NULL GROUP BY o.optimizationType")
    List<Object[]> getOptimizationTypeStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT SUM(o.costSavings) FROM DatabaseOptimization o WHERE o.tenantId = :tenantId AND o.costSavings IS NOT NULL")
    Double getTotalCostSavings(@Param("tenantId") UUID tenantId);

    @Query("SELECT o FROM DatabaseOptimization o WHERE o.tenantId = :tenantId AND o.name LIKE %:name%")
    List<DatabaseOptimization> findByTenantIdAndNameContaining(@Param("tenantId") UUID tenantId, @Param("name") String name);

    @Query("SELECT o FROM DatabaseOptimization o WHERE o.tenantId = :tenantId AND o.category = :category")
    List<DatabaseOptimization> findByTenantIdAndCategory(@Param("tenantId") UUID tenantId, @Param("category") String category);

    @Query("SELECT COUNT(o) FROM DatabaseOptimization o WHERE o.tenantId = :tenantId AND o.databaseType = :databaseType AND o.status = :status")
    long countByTenantIdAndDatabaseTypeAndStatus(@Param("tenantId") UUID tenantId, 
                                                @Param("databaseType") String databaseType, 
                                                @Param("status") DatabaseOptimization.Status status);

    @Query("SELECT o FROM DatabaseOptimization o WHERE o.tenantId = :tenantId AND o.actualDurationMinutes > :maxDuration")
    List<DatabaseOptimization> findByTenantIdAndActualDurationMinutesGreaterThan(@Param("tenantId") UUID tenantId, @Param("maxDuration") Double maxDuration);

    @Query("SELECT o FROM DatabaseOptimization o WHERE o.tenantId = :tenantId AND o.estimatedDurationMinutes > :maxEstimatedDuration")
    List<DatabaseOptimization> findByTenantIdAndEstimatedDurationMinutesGreaterThan(@Param("tenantId") UUID tenantId, @Param("maxEstimatedDuration") Integer maxEstimatedDuration);

    @Query("SELECT COUNT(o) FROM DatabaseOptimization o WHERE o.tenantId = :tenantId AND o.isHighRisk = true AND o.status = :status")
    long countHighRiskOptimizationsByStatus(@Param("tenantId") UUID tenantId, @Param("status") DatabaseOptimization.Status status);

    @Query("SELECT o FROM DatabaseOptimization o WHERE o.tenantId = :tenantId AND o.riskLevel = :riskLevel")
    List<DatabaseOptimization> findByTenantIdAndRiskLevel(@Param("tenantId") UUID tenantId, @Param("riskLevel") String riskLevel);
}
