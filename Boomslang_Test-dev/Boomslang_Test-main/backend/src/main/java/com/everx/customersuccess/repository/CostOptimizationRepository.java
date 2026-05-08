package com.everx.customersuccess.repository;

import com.everx.customersuccess.entity.CostOptimization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface CostOptimizationRepository extends JpaRepository<CostOptimization, UUID> {

    List<CostOptimization> findByTenantId(UUID tenantId);

    List<CostOptimization> findByTenantIdAndCustomerId(UUID tenantId, UUID customerId);

    List<CostOptimization> findByTenantIdAndStatus(UUID tenantId, CostOptimization.Status status);

    List<CostOptimization> findByTenantIdAndOptimizationType(UUID tenantId, CostOptimization.OptimizationType optimizationType);

    @Query("SELECT o FROM CostOptimization o WHERE o.tenantId = :tenantId AND o.isActive = true")
    List<CostOptimization> findActiveOptimizations(@Param("tenantId") UUID tenantId);

    @Query("SELECT o FROM CostOptimization o WHERE o.tenantId = :tenantId AND o.isImplemented = true")
    List<CostOptimization> findImplementedOptimizations(@Param("tenantId") UUID tenantId);

    @Query("SELECT o FROM CostOptimization o WHERE o.tenantId = :tenantId AND o.isCompleted = true")
    List<CostOptimization> findCompletedOptimizations(@Param("tenantId") UUID tenantId);

    @Query("SELECT o FROM CostOptimization o WHERE o.tenantId = :tenantId AND o.hasPositiveROI = true")
    List<CostOptimization> findOptimizationsWithPositiveROI(@Param("tenantId") UUID tenantId);

    @Query("SELECT o FROM CostOptimization o WHERE o.tenantId = :tenantId AND o.hasHighImpact = true")
    List<CostOptimization> findHighImpactOptimizations(@Param("tenantId") UUID tenantId);

    @Query("SELECT o FROM CostOptimization o WHERE o.tenantId = :tenantId AND o.needsReview = true")
    List<CostOptimization> findOptimizationsNeedingReview(@Param("tenantId") UUID tenantId);

    @Query("SELECT o FROM CostOptimization o WHERE o.tenantId = :tenantId AND o.isOverdue = true")
    List<CostOptimization> findOverdueOptimizations(@Param("tenantId") UUID tenantId);

    @Query("SELECT COUNT(o) FROM CostOptimization o WHERE o.tenantId = :tenantId AND o.status = :status")
    long countByTenantIdAndStatus(@Param("tenantId") UUID tenantId, @Param("status") CostOptimization.Status status);

    @Query("SELECT COUNT(o) FROM CostOptimization o WHERE o.tenantId = :tenantId AND o.optimizationType = :optimizationType")
    long countByTenantIdAndOptimizationType(@Param("tenantId") UUID tenantId, @Param("optimizationType") CostOptimization.OptimizationType optimizationType);

    @Query("SELECT SUM(o.monthlySavings) FROM CostOptimization o WHERE o.tenantId = :tenantId AND o.monthlySavings IS NOT NULL")
    Double getTotalMonthlySavings(@Param("tenantId") UUID tenantId);

    @Query("SELECT SUM(o.annualSavings) FROM CostOptimization o WHERE o.tenantId = :tenantId AND o.annualSavings IS NOT NULL")
    Double getTotalAnnualSavings(@Param("tenantId") UUID tenantId);

    @Query("SELECT SUM(o.implementationCost) FROM CostOptimization o WHERE o.tenantId = :tenantId AND o.implementationCost IS NOT NULL")
    Double getTotalImplementationCost(@Param("tenantId") UUID tenantId);

    @Query("SELECT AVG(o.roiPercentage) FROM CostOptimization o WHERE o.tenantId = :tenantId AND o.roiPercentage IS NOT NULL")
    Double getAverageROI(@Param("tenantId") UUID tenantId);

    @Query("SELECT AVG(o.paybackPeriodMonths) FROM CostOptimization o WHERE o.tenantId = :tenantId AND o.paybackPeriodMonths IS NOT NULL")
    Double getAveragePaybackPeriod(@Param("tenantId") UUID tenantId);

    @Query("SELECT o.optimizationType, COUNT(o) FROM CostOptimization o WHERE o.tenantId = :tenantId GROUP BY o.optimizationType")
    List<Object[]> getOptimizationTypeStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT o.status, COUNT(o) FROM CostOptimization o WHERE o.tenantId = :tenantId GROUP BY o.status")
    List<Object[]> getStatusStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT o.priority, COUNT(o) FROM CostOptimization o WHERE o.tenantId = :tenantId AND o.priority IS NOT NULL GROUP BY o.priority")
    List<Object[]> getPriorityStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT o.category, COUNT(o) FROM CostOptimization o WHERE o.tenantId = :tenantId AND o.category IS NOT NULL GROUP BY o.category")
    List<Object[]> getCategoryStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT o FROM CostOptimization o WHERE o.tenantId = :tenantId AND o.createdBy = :createdBy")
    List<CostOptimization> findByTenantIdAndCreatedBy(@Param("tenantId") UUID tenantId, @Param("createdBy") String createdBy);

    @Query("SELECT o FROM CostOptimization o WHERE o.tenantId = :tenantId AND o.createdAt BETWEEN :startDate AND :endDate")
    List<CostOptimization> findByTenantIdAndCreatedAtBetween(@Param("tenantId") UUID tenantId, 
                                                             @Param("startDate") LocalDateTime startDate, 
                                                             @Param("endDate") LocalDateTime endDate);

    @Query("SELECT o FROM CostOptimization o WHERE o.tenantId = :tenantId AND o.implementedAt BETWEEN :startDate AND :endDate")
    List<CostOptimization> findByTenantIdAndImplementedAtBetween(@Param("tenantId") UUID tenantId, 
                                                                @Param("startDate") LocalDateTime startDate, 
                                                                @Param("endDate") LocalDateTime endDate);

    @Query("SELECT o FROM CostOptimization o WHERE o.tenantId = :tenantId AND o.monthlySavings >= :minSavings ORDER BY o.monthlySavings DESC")
    List<CostOptimization> findByTenantIdAndMonthlySavingsGreaterThanEqualOrderByMonthlySavingsDesc(@Param("tenantId") UUID tenantId, 
                                                                                                     @Param("minSavings") Double minSavings);

    @Query("SELECT o FROM CostOptimization o WHERE o.tenantId = :tenantId AND o.roiPercentage >= :minROI ORDER BY o.roiPercentage DESC")
    List<CostOptimization> findByTenantIdAndROIPercentageGreaterThanEqualOrderByROIPercentageDesc(@Param("tenantId") UUID tenantId, 
                                                                                                   @Param("minROI") Double minROI);

    @Query("SELECT o FROM CostOptimization o WHERE o.tenantId = :tenantId AND o.paybackPeriodMonths <= :maxMonths ORDER BY o.paybackPeriodMonths")
    List<CostOptimization> findByTenantIdAndPaybackPeriodMonthsLessThanEqualOrderByPaybackPeriodMonths(@Param("tenantId") UUID tenantId, 
                                                                                                       @Param("maxMonths") Integer maxMonths);

    @Query("SELECT o FROM CostOptimization o WHERE o.tenantId = :tenantId AND o.effortRequired = :effortRequired")
    List<CostOptimization> findByTenantIdAndEffortRequired(@Param("tenantId") UUID tenantId, @Param("effortRequired") String effortRequired);

    @Query("SELECT o FROM CostOptimization o WHERE o.tenantId = :tenantId AND o.impactLevel = :impactLevel")
    List<CostOptimization> findByTenantIdAndImpactLevel(@Param("tenantId") UUID tenantId, @Param("impactLevel") String impactLevel);

    @Query("SELECT o FROM CostOptimization o WHERE o.tenantId = :tenantId AND o.name LIKE %:name%")
    List<CostOptimization> findByTenantIdAndNameContaining(@Param("tenantId") UUID tenantId, @Param("name") String name);

    @Query("SELECT o FROM CostOptimization o WHERE o.tenantId = :tenantId AND o.tags LIKE %:tag%")
    List<CostOptimization> findByTenantIdAndTagContaining(@Param("tenantId") UUID tenantId, @Param("tag") String tag);

    @Query("SELECT COUNT(o) FROM CostOptimization o WHERE o.tenantId = :tenantId AND o.optimizationType = :optimizationType AND o.status = :status")
    long countByTenantIdAndOptimizationTypeAndStatus(@Param("tenantId") UUID tenantId, 
                                                     @Param("optimizationType") CostOptimization.OptimizationType optimizationType, 
                                                     @Param("status") CostOptimization.Status status);

    @Query("SELECT o FROM CostOptimization o WHERE o.tenantId = :tenantId AND o.nextReviewDate < :now AND o.status = :status")
    List<CostOptimization> findOverdueReviews(@Param("tenantId") UUID tenantId, 
                                              @Param("now") LocalDateTime now, 
                                              @Param("status") CostOptimization.Status status);

    @Query("SELECT SUM(o.getTotalSavingsToDate()) FROM CostOptimization o WHERE o.tenantId = :tenantId AND o.implementedAt IS NOT NULL")
    Double getTotalSavingsToDate(@Param("tenantId") UUID tenantId);

    @Query("SELECT COUNT(o) FROM CostOptimization o WHERE o.tenantId = :tenantId AND o.hasAchievedPayback = true")
    long countByTenantIdAndHasAchievedPayback(@Param("tenantId") UUID tenantId);

    @Query("SELECT o FROM CostOptimization o WHERE o.tenantId = :tenantId AND o.isRecurring = true")
    List<CostOptimization> findRecurringOptimizations(@Param("tenantId") UUID tenantId);

    @Query("SELECT o FROM CostOptimization o WHERE o.tenantId = :tenantId AND o.recurringFrequency = :frequency")
    List<CostOptimization> findByTenantIdAndRecurringFrequency(@Param("tenantId") UUID tenantId, @Param("frequency") String frequency);

    @Query("SELECT o FROM CostOptimization o WHERE o.tenantId = :tenantId AND o.implementationCost <= :maxCost ORDER BY o.implementationCost")
    List<CostOptimization> findByTenantIdAndImplementationCostLessThanEqualOrderByImplementationCost(@Param("tenantId") UUID tenantId, 
                                                                                                     @Param("maxCost") Double maxCost);

    @Query("SELECT o FROM CostOptimization o WHERE o.tenantId = :tenantId AND o.targetCompletionDate < :now AND o.status != 'COMPLETED'")
    List<CostOptimization> findOptimizationsPastTargetDate(@Param("tenantId") UUID tenantId, @Param("now") LocalDateTime now);
}
