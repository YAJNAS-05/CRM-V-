package com.everx.customersuccess.repository;

import com.everx.customersuccess.entity.CustomerSuccessPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface CustomerSuccessPlanRepository extends JpaRepository<CustomerSuccessPlan, UUID> {

    List<CustomerSuccessPlan> findByTenantId(UUID tenantId);

    List<CustomerSuccessPlan> findByTenantIdAndCustomerId(UUID tenantId, UUID customerId);

    List<CustomerSuccessPlan> findByTenantIdAndStatus(UUID tenantId, CustomerSuccessPlan.Status status);

    @Query("SELECT p FROM CustomerSuccessPlan p WHERE p.tenantId = :tenantId AND p.customerSuccessManagerId = :managerId")
    List<CustomerSuccessPlan> findByTenantIdAndCustomerSuccessManagerId(@Param("tenantId") UUID tenantId, 
                                                                          @Param("managerId") UUID managerId);

    @Query("SELECT COUNT(p) FROM CustomerSuccessPlan p WHERE p.tenantId = :tenantId AND p.status = :status")
    long countByTenantIdAndStatus(@Param("tenantId") UUID tenantId, @Param("status") CustomerSuccessPlan.Status status);

    @Query("SELECT p FROM CustomerSuccessPlan p WHERE p.tenantId = :tenantId AND p.needsReview = true")
    List<CustomerSuccessPlan> findPlansNeedingReview(@Param("tenantId") UUID tenantId);

    @Query("SELECT p FROM CustomerSuccessPlan p WHERE p.tenantId = :tenantId AND p.isAtRisk = true")
    List<CustomerSuccessPlan> findAtRiskPlans(@Param("tenantId") UUID tenantId);

    @Query("SELECT p FROM CustomerSuccessPlan p WHERE p.tenantId = :tenantId AND p.hasOverdueMilestones = true")
    List<CustomerSuccessPlan> findPlansWithOverdueMilestones(@Param("tenantId") UUID tenantId);

    @Query("SELECT p FROM CustomerSuccessPlan p WHERE p.tenantId = :tenantId AND p.planType = :planType")
    List<CustomerSuccessPlan> findByTenantIdAndPlanType(@Param("tenantId") UUID tenantId, 
                                                        @Param("planType") CustomerSuccessPlan.PlanType planType);

    @Query("SELECT p FROM CustomerSuccessPlan p WHERE p.tenantId = :tenantId AND p.priority = :priority")
    List<CustomerSuccessPlan> findByTenantIdAndPriority(@Param("tenantId") UUID tenantId, 
                                                        @Param("priority") CustomerSuccessPlan.Priority priority);

    @Query("SELECT p FROM CustomerSuccessPlan p WHERE p.tenantId = :tenantId AND p.industry = :industry")
    List<CustomerSuccessPlan> findByTenantIdAndIndustry(@Param("tenantId") UUID tenantId, 
                                                        @Param("industry") String industry);

    @Query("SELECT p FROM CustomerSuccessPlan p WHERE p.tenantId = :tenantId AND p.companySize = :companySize")
    List<CustomerSuccessPlan> findByTenantIdAndCompanySize(@Param("tenantId") UUID tenantId, 
                                                           @Param("companySize") String companySize);

    @Query("SELECT p FROM CustomerSuccessPlan p WHERE p.tenantId = :tenantId AND p.subscriptionTier = :subscriptionTier")
    List<CustomerSuccessPlan> findByTenantIdAndSubscriptionTier(@Param("tenantId") UUID tenantId, 
                                                                @Param("subscriptionTier") String subscriptionTier);

    @Query("SELECT p FROM CustomerSuccessPlan p WHERE p.tenantId = :tenantId AND p.startDate BETWEEN :startDate AND :endDate")
    List<CustomerSuccessPlan> findByTenantIdAndStartDateBetween(@Param("tenantId") UUID tenantId, 
                                                               @Param("startDate") LocalDateTime startDate, 
                                                               @Param("endDate") LocalDateTime endDate);

    @Query("SELECT p FROM CustomerSuccessPlan p WHERE p.tenantId = :tenantId AND p.endDate BETWEEN :startDate AND :endDate")
    List<CustomerSuccessPlan> findByTenantIdAndEndDateBetween(@Param("tenantId") UUID tenantId, 
                                                             @Param("startDate") LocalDateTime startDate, 
                                                             @Param("endDate") LocalDateTime endDate);

    @Query("SELECT AVG(p.completionPercentage) FROM CustomerSuccessPlan p WHERE p.tenantId = :tenantId AND p.status = :status")
    Double getAverageCompletionPercentage(@Param("tenantId") UUID tenantId, @Param("status") CustomerSuccessPlan.Status status);

    @Query("SELECT AVG(p.healthScore) FROM CustomerSuccessPlan p WHERE p.tenantId = :tenantId AND p.healthScore IS NOT NULL")
    Double getAverageHealthScore(@Param("tenantId") UUID tenantId);

    @Query("SELECT p.planType, COUNT(p) FROM CustomerSuccessPlan p WHERE p.tenantId = :tenantId GROUP BY p.planType")
    List<Object[]> getPlanTypeStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT p.status, COUNT(p) FROM CustomerSuccessPlan p WHERE p.tenantId = :tenantId GROUP BY p.status")
    List<Object[]> getStatusStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT p.priority, COUNT(p) FROM CustomerSuccessPlan p WHERE p.tenantId = :tenantId GROUP BY p.priority")
    List<Object[]> getPriorityStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT p.riskLevel, COUNT(p) FROM CustomerSuccessPlan p WHERE p.tenantId = :tenantId AND p.riskLevel IS NOT NULL GROUP BY p.riskLevel")
    List<Object[]> getRiskLevelStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT p.industry, COUNT(p) FROM CustomerSuccessPlan p WHERE p.tenantId = :tenantId AND p.industry IS NOT NULL GROUP BY p.industry")
    List<Object[]> getIndustryStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT p FROM CustomerSuccessPlan p WHERE p.tenantId = :tenantId AND p.name LIKE %:name%")
    List<CustomerSuccessPlan> findByTenantIdAndNameContaining(@Param("tenantId") UUID tenantId, @Param("name") String name);

    @Query("SELECT p FROM CustomerSuccessPlan p WHERE p.tenantId = :tenantId AND p.completionPercentage >= :minPercentage ORDER BY p.completionPercentage DESC")
    List<CustomerSuccessPlan> findByTenantIdAndCompletionPercentageGreaterThanEqualOrderByCompletionPercentageDesc(@Param("tenantId") UUID tenantId, 
                                                                                                                   @Param("minPercentage") Double minPercentage);

    @Query("SELECT COUNT(p) FROM CustomerSuccessPlan p WHERE p.tenantId = :tenantId AND p.planType = :planType AND p.status = :status")
    long countByTenantIdAndPlanTypeAndStatus(@Param("tenantId") UUID tenantId, 
                                             @Param("planType") CustomerSuccessPlan.PlanType planType, 
                                             @Param("status") CustomerSuccessPlan.Status status);

    @Query("SELECT p FROM CustomerSuccessPlan p WHERE p.tenantId = :tenantId AND p.lastReviewDate < :cutoffDate AND p.status = :status")
    List<CustomerSuccessPlan> findPlansNeedingReviewByDate(@Param("tenantId") UUID tenantId, 
                                                           @Param("cutoffDate") LocalDateTime cutoffDate, 
                                                           @Param("status") CustomerSuccessPlan.Status status);

    @Query("SELECT SUM(p.getTotalGoalsCount()) FROM CustomerSuccessPlan p WHERE p.tenantId = :tenantId")
    Long getTotalGoalsCount(@Param("tenantId") UUID tenantId);

    @Query("SELECT SUM(p.getCompletedGoalsCount()) FROM CustomerSuccessPlan p WHERE p.tenantId = :tenantId")
    Long getTotalCompletedGoalsCount(@Param("tenantId") UUID tenantId);

    @Query("SELECT p FROM CustomerSuccessPlan p WHERE p.tenantId = :tenantId AND p.createdBy = :createdBy")
    List<CustomerSuccessPlan> findByTenantIdAndCreatedBy(@Param("tenantId") UUID tenantId, @Param("createdBy") String createdBy);

    @Query("SELECT p FROM CustomerSuccessPlan p WHERE p.tenantId = :tenantId AND p.tags LIKE %:tag%")
    List<CustomerSuccessPlan> findByTenantIdAndTagContaining(@Param("tenantId") UUID tenantId, @Param("tag") String tag);
}
