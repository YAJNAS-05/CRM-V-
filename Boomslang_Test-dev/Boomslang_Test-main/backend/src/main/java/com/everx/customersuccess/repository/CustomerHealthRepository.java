package com.everx.customersuccess.repository;

import com.everx.customersuccess.entity.CustomerHealth;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface CustomerHealthRepository extends JpaRepository<CustomerHealth, UUID> {

    List<CustomerHealth> findByTenantId(UUID tenantId);

    List<CustomerHealth> findByTenantIdAndCustomerId(UUID tenantId, UUID customerId);

    List<CustomerHealth> findByTenantIdAndHealthStatus(UUID tenantId, CustomerHealth.HealthStatus healthStatus);

    List<CustomerHealth> findByTenantIdAndRiskLevel(UUID tenantId, CustomerHealth.RiskLevel riskLevel);

    @Query("SELECT h FROM CustomerHealth h WHERE h.tenantId = :tenantId AND h.isHealthy = true")
    List<CustomerHealth> findHealthyCustomers(@Param("tenantId") UUID tenantId);

    @Query("SELECT h FROM CustomerHealth h WHERE h.tenantId = :tenantId AND h.isAtRisk = true")
    List<CustomerHealth> findAtRiskCustomers(@Param("tenantId") UUID tenantId);

    @Query("SELECT h FROM CustomerHealth h WHERE h.tenantId = :tenantId AND h.needsAttention = true")
    List<CustomerHealth> findCustomersNeedingAttention(@Param("tenantId") UUID tenantId);

    @Query("SELECT h FROM CustomerHealth h WHERE h.tenantId = :tenantId AND h.hasHighChurnRisk = true")
    List<CustomerHealth> findCustomersWithHighChurnRisk(@Param("tenantId") UUID tenantId);

    @Query("SELECT h FROM CustomerHealth h WHERE h.tenantId = :tenantId AND h.hasLowAdoption = true")
    List<CustomerHealth> findCustomersWithLowAdoption(@Param("tenantId") UUID tenantId);

    @Query("SELECT h FROM CustomerHealth h WHERE h.tenantId = :tenantId AND h.hasSupportIssues = true")
    List<CustomerHealth> findCustomersWithSupportIssues(@Param("tenantId") UUID tenantId);

    @Query("SELECT h FROM CustomerHealth h WHERE h.tenantId = :tenantId AND h.needsReview = true")
    List<CustomerHealth> findCustomersNeedingReview(@Param("tenantId") UUID tenantId);

    @Query("SELECT h FROM CustomerHealth h WHERE h.tenantId = :tenantId AND h.hasActiveAlerts = true")
    List<CustomerHealth> findCustomersWithActiveAlerts(@Param("tenantId") UUID tenantId);

    @Query("SELECT COUNT(h) FROM CustomerHealth h WHERE h.tenantId = :tenantId AND h.healthStatus = :healthStatus")
    long countByTenantIdAndHealthStatus(@Param("tenantId") UUID tenantId, @Param("healthStatus") CustomerHealth.HealthStatus healthStatus);

    @Query("SELECT COUNT(h) FROM CustomerHealth h WHERE h.tenantId = :tenantId AND h.riskLevel = :riskLevel")
    long countByTenantIdAndRiskLevel(@Param("tenantId") UUID tenantId, @Param("riskLevel") CustomerHealth.RiskLevel riskLevel);

    @Query("SELECT AVG(h.overallHealthScore) FROM CustomerHealth h WHERE h.tenantId = :tenantId")
    Double getAverageHealthScore(@Param("tenantId") UUID tenantId);

    @Query("SELECT AVG(h.productAdoptionScore) FROM CustomerHealth h WHERE h.tenantId = :tenantId AND h.productAdoptionScore IS NOT NULL")
    Double getAverageAdoptionScore(@Param("tenantId") UUID tenantId);

    @Query("SELECT AVG(h.npsScore) FROM CustomerHealth h WHERE h.tenantId = :tenantId AND h.npsScore IS NOT NULL")
    Double getAverageNPSScore(@Param("tenantId") UUID tenantId);

    @Query("SELECT AVG(h.csatScore) FROM CustomerHealth h WHERE h.tenantId = :tenantId AND h.csatScore IS NOT NULL")
    Double getAverageCSATScore(@Param("tenantId") UUID tenantId);

    @Query("SELECT AVG(h.renewalProbability) FROM CustomerHealth h WHERE h.tenantId = :tenantId AND h.renewalProbability IS NOT NULL")
    Double getAverageRenewalProbability(@Param("tenantId") UUID tenantId);

    @Query("SELECT AVG(h.expansionProbability) FROM CustomerHealth h WHERE h.tenantId = :tenantId AND h.expansionProbability IS NOT NULL")
    Double getAverageExpansionProbability(@Param("tenantId") UUID tenantId);

    @Query("SELECT h.healthStatus, COUNT(h) FROM CustomerHealth h WHERE h.tenantId = :tenantId GROUP BY h.healthStatus")
    List<Object[]> getHealthStatusStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT h.riskLevel, COUNT(h) FROM CustomerHealth h WHERE h.tenantId = :tenantId GROUP BY h.riskLevel")
    List<Object[]> getRiskLevelStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT h FROM CustomerHealth h WHERE h.tenantId = :tenantId AND h.calculatedAt BETWEEN :startDate AND :endDate")
    List<CustomerHealth> findByTenantIdAndCalculatedAtBetween(@Param("tenantId") UUID tenantId, 
                                                              @Param("startDate") LocalDateTime startDate, 
                                                              @Param("endDate") LocalDateTime endDate);

    @Query("SELECT h FROM CustomerHealth h WHERE h.tenantId = :tenantId AND h.lastActivityDate < :cutoffDate")
    List<CustomerHealth> findCustomersWithLowActivity(@Param("tenantId") UUID tenantId, @Param("cutoffDate") LocalDateTime cutoffDate);

    @Query("SELECT h FROM CustomerHealth h WHERE h.tenantId = :tenantId AND h.userAdoptionRate < :threshold")
    List<CustomerHealth> findCustomersWithLowUserAdoption(@Param("tenantId") UUID tenantId, @Param("threshold") Double threshold);

    @Query("SELECT h FROM CustomerHealth h WHERE h.tenantId = :tenantId AND h.featureAdoptionRate < :threshold")
    List<CustomerHealth> findCustomersWithLowFeatureAdoption(@Param("tenantId") UUID tenantId, @Param("threshold") Double threshold);

    @Query("SELECT h FROM CustomerHealth h WHERE h.tenantId = :tenantId AND h.supportTicketsOpen > :threshold")
    List<CustomerHealth> findCustomersWithHighSupportTickets(@Param("tenantId") UUID tenantId, @Param("threshold") Integer threshold);

    @Query("SELECT h FROM CustomerHealth h WHERE h.tenantId = :tenantId AND h.escalationCount > :threshold")
    List<CustomerHealth> findCustomersWithHighEscalations(@Param("tenantId") UUID tenantId, @Param("threshold") Integer threshold);

    @Query("SELECT SUM(h.getUnresolvedAlertsCount()) FROM CustomerHealth h WHERE h.tenantId = :tenantId")
    Long getTotalUnresolvedAlertsCount(@Param("tenantId") UUID tenantId);

    @Query("SELECT h FROM CustomerHealth h WHERE h.tenantId = :tenantId AND h.overallHealthScore BETWEEN :minScore AND :maxScore ORDER BY h.overallHealthScore")
    List<CustomerHealth> findByTenantIdAndOverallHealthScoreBetweenOrderByOverallHealthScore(@Param("tenantId") UUID tenantId, 
                                                                                             @Param("minScore") Integer minScore, 
                                                                                             @Param("maxScore") Integer maxScore);

    @Query("SELECT h FROM CustomerHealth h WHERE h.tenantId = :tenantId AND h.churnRiskScore >= :threshold ORDER BY h.churnRiskScore DESC")
    List<CustomerHealth> findByTenantIdAndChurnRiskScoreGreaterThanEqualOrderByChurnRiskScoreDesc(@Param("tenantId") UUID tenantId, 
                                                                                                   @Param("threshold") Integer threshold);

    @Query("SELECT COUNT(h) FROM CustomerHealth h WHERE h.tenantId = :tenantId AND h.churnRiskScore >= :threshold")
    long countByTenantIdAndChurnRiskScoreGreaterThanEqual(@Param("tenantId") UUID tenantId, @Param("threshold") Integer threshold);

    @Query("SELECT h FROM CustomerHealth h WHERE h.tenantId = :tenantId AND h.nextReviewDate < :now AND h.healthStatus != 'COMPLETED'")
    List<CustomerHealth> findOverdueHealthReviews(@Param("tenantId") UUID tenantId, @Param("now") LocalDateTime now);

    @Query("SELECT AVG(h.averageResolutionTimeHours) FROM CustomerHealth h WHERE h.tenantId = :tenantId AND h.averageResolutionTimeHours IS NOT NULL")
    Double getAverageResolutionTime(@Param("tenantId") UUID tenantId);

    @Query("SELECT SUM(h.activeUsersCount) FROM CustomerHealth h WHERE h.tenantId = :tenantId AND h.activeUsersCount IS NOT NULL")
    Long getTotalActiveUsers(@Param("tenantId") UUID tenantId);

    @Query("SELECT SUM(h.totalUsersCount) FROM CustomerHealth h WHERE h.tenantId = :tenantId AND h.totalUsersCount IS NOT NULL")
    Long getTotalUsers(@Param("tenantId") UUID tenantId);

    @Query("SELECT h FROM CustomerHealth h WHERE h.tenantId = :tenantId AND h.renewalProbability < :threshold ORDER BY h.renewalProbability")
    List<CustomerHealth> findCustomersWithLowRenewalProbability(@Param("tenantId") UUID tenantId, @Param("threshold") Integer threshold);

    @Query("SELECT h FROM CustomerHealth h WHERE h.tenantId = :tenantId AND h.expansionProbability > :threshold ORDER BY h.expansionProbability DESC")
    List<CustomerHealth> findCustomersWithHighExpansionProbability(@Param("tenantId") UUID tenantId, @Param("threshold") Integer threshold);
}
