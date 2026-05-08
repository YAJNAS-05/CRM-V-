package com.everx.customersuccess.repository;

import com.everx.customersuccess.entity.OnboardingWizard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface OnboardingWizardRepository extends JpaRepository<OnboardingWizard, UUID> {

    List<OnboardingWizard> findByTenantId(UUID tenantId);

    List<OnboardingWizard> findByTenantIdAndCustomerId(UUID tenantId, UUID customerId);

    List<OnboardingWizard> findByTenantIdAndStatus(UUID tenantId, OnboardingWizard.Status status);

    List<OnboardingWizard> findByTenantIdAndWizardType(UUID tenantId, OnboardingWizard.WizardType wizardType);

    @Query("SELECT w FROM OnboardingWizard w WHERE w.tenantId = :tenantId AND w.isActive = true")
    List<OnboardingWizard> findActiveWizards(@Param("tenantId") UUID tenantId);

    @Query("SELECT w FROM OnboardingWizard w WHERE w.tenantId = :tenantId AND w.isCompleted = true")
    List<OnboardingWizard> findCompletedWizards(@Param("tenantId") UUID tenantId);

    @Query("SELECT w FROM OnboardingWizard w WHERE w.tenantId = :tenantId AND w.isPaused = true")
    List<OnboardingWizard> findPausedWizards(@Param("tenantId") UUID tenantId);

    @Query("SELECT w FROM OnboardingWizard w WHERE w.tenantId = :tenantId AND w.isOverdue = true")
    List<OnboardingWizard> findOverdueWizards(@Param("tenantId") UUID tenantId);

    @Query("SELECT w FROM OnboardingWizard w WHERE w.tenantId = :tenantId AND w.needsReminder = true")
    List<OnboardingWizard> findWizardsNeedingReminder(@Param("tenantId") UUID tenantId);

    @Query("SELECT COUNT(w) FROM OnboardingWizard w WHERE w.tenantId = :tenantId AND w.status = :status")
    long countByTenantIdAndStatus(@Param("tenantId") UUID tenantId, @Param("status") OnboardingWizard.Status status);

    @Query("SELECT COUNT(w) FROM OnboardingWizard w WHERE w.tenantId = :tenantId AND w.wizardType = :wizardType")
    long countByTenantIdAndWizardType(@Param("tenantId") UUID tenantId, @Param("wizardType") OnboardingWizard.WizardType wizardType);

    @Query("SELECT AVG(w.completionPercentage) FROM OnboardingWizard w WHERE w.tenantId = :tenantId AND w.completionPercentage IS NOT NULL")
    Double getAverageCompletionPercentage(@Param("tenantId") UUID tenantId);

    @Query("SELECT AVG(w.actualDurationMinutes) FROM OnboardingWizard w WHERE w.tenantId = :tenantId AND w.actualDurationMinutes IS NOT NULL")
    Double getAverageActualDuration(@Param("tenantId") UUID tenantId);

    @Query("SELECT w.wizardType, COUNT(w) FROM OnboardingWizard w WHERE w.tenantId = :tenantId GROUP BY w.wizardType")
    List<Object[]> getWizardTypeStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT w.status, COUNT(w) FROM OnboardingWizard w WHERE w.tenantId = :tenantId GROUP BY w.status")
    List<Object[]> getStatusStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT w.industry, COUNT(w) FROM OnboardingWizard w WHERE w.tenantId = :tenantId AND w.industry IS NOT NULL GROUP BY w.industry")
    List<Object[]> getIndustryStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT w FROM OnboardingWizard w WHERE w.tenantId = :tenantId AND w.companySize = :companySize")
    List<OnboardingWizard> findByTenantIdAndCompanySize(@Param("tenantId") UUID tenantId, @Param("companySize") String companySize);

    @Query("SELECT w FROM OnboardingWizard w WHERE w.tenantId = :tenantId AND w.industry = :industry")
    List<OnboardingWizard> findByTenantIdAndIndustry(@Param("tenantId") UUID tenantId, @Param("industry") OnboardingWizard.Industry industry);

    @Query("SELECT w FROM OnboardingWizard w WHERE w.tenantId = :tenantId AND w.startedAt BETWEEN :startDate AND :endDate")
    List<OnboardingWizard> findByTenantIdAndStartedAtBetween(@Param("tenantId") UUID tenantId, 
                                                             @Param("startDate") LocalDateTime startDate, 
                                                             @Param("endDate") LocalDateTime endDate);

    @Query("SELECT w FROM OnboardingWizard w WHERE w.tenantId = :tenantId AND w.completedAt BETWEEN :startDate AND :endDate")
    List<OnboardingWizard> findByTenantIdAndCompletedAtBetween(@Param("tenantId") UUID tenantId, 
                                                              @Param("startDate") LocalDateTime startDate, 
                                                              @Param("endDate") LocalDateTime endDate);

    @Query("SELECT w FROM OnboardingWizard w WHERE w.tenantId = :tenantId AND w.assignedTo = :assignedTo")
    List<OnboardingWizard> findByTenantIdAndAssignedTo(@Param("tenantId") UUID tenantId, @Param("assignedTo") String assignedTo);

    @Query("SELECT w FROM OnboardingWizard w WHERE w.tenantId = :tenantId AND w.createdBy = :createdBy")
    List<OnboardingWizard> findByTenantIdAndCreatedBy(@Param("tenantId") UUID tenantId, @Param("createdBy") String createdBy);

    @Query("SELECT w FROM OnboardingWizard w WHERE w.tenantId = :tenantId AND w.name LIKE %:name%")
    List<OnboardingWizard> findByTenantIdAndNameContaining(@Param("tenantId") UUID tenantId, @Param("name") String name);

    @Query("SELECT w FROM OnboardingWizard w WHERE w.tenantId = :tenantId AND w.completionPercentage >= :minPercentage ORDER BY w.completionPercentage DESC")
    List<OnboardingWizard> findByTenantIdAndCompletionPercentageGreaterThanEqualOrderByCompletionPercentageDesc(@Param("tenantId") UUID tenantId, 
                                                                                                                   @Param("minPercentage") Double minPercentage);

    @Query("SELECT w FROM OnboardingWizard w WHERE w.tenantId = :tenantId AND w.completionPercentage < :maxPercentage ORDER BY w.completionPercentage")
    List<OnboardingWizard> findByTenantIdAndCompletionPercentageLessThanOrderByCompletionPercentage(@Param("tenantId") UUID tenantId, 
                                                                                                     @Param("maxPercentage") Double maxPercentage);

    @Query("SELECT w FROM OnboardingWizard w WHERE w.tenantId = :tenantId AND w.nextStepDueDate < :now AND w.status = :status")
    List<OnboardingWizard> findWizardsWithOverdueSteps(@Param("tenantId") UUID tenantId, 
                                                        @Param("now") LocalDateTime now, 
                                                        @Param("status") OnboardingWizard.Status status);

    @Query("SELECT SUM(w.getTotalChecklistItemsCount()) FROM OnboardingWizard w WHERE w.tenantId = :tenantId")
    Long getTotalChecklistItemsCount(@Param("tenantId") UUID tenantId);

    @Query("SELECT SUM(w.getCompletedChecklistItemsCount()) FROM OnboardingWizard w WHERE w.tenantId = :tenantId")
    Long getTotalCompletedChecklistItemsCount(@Param("tenantId") UUID tenantId);

    @Query("SELECT COUNT(w) FROM OnboardingWizard w WHERE w.tenantId = :tenantId AND w.wizardType = :wizardType AND w.status = :status")
    long countByTenantIdAndWizardTypeAndStatus(@Param("tenantId") UUID tenantId, 
                                               @Param("wizardType") OnboardingWizard.WizardType wizardType, 
                                               @Param("status") OnboardingWizard.Status status);

    @Query("SELECT w FROM OnboardingWizard w WHERE w.tenantId = :tenantId AND w.isSkippable = true")
    List<OnboardingWizard> findSkippableWizards(@Param("tenantId") UUID tenantId);

    @Query("SELECT w FROM OnboardingWizard w WHERE w.tenantId = :tenantId AND w.isRequired = true")
    List<OnboardingWizard> findRequiredWizards(@Param("tenantId") UUID tenantId);

    @Query("SELECT w FROM OnboardingWizard w WHERE w.tenantId = :tenantId AND w.autoProgress = true")
    List<OnboardingWizard> findAutoProgressWizards(@Param("tenantId") UUID tenantId);

    @Query("SELECT w FROM OnboardingWizard w WHERE w.tenantId = :tenantId AND w.sendReminders = true")
    List<OnboardingWizard> findWizardsWithReminders(@Param("tenantId") UUID tenantId);

    @Query("SELECT w FROM OnboardingWizard w WHERE w.tenantId = :tenantId AND w.lastActivityDate < :cutoffDate AND w.status = :status")
    List<OnboardingWizard> findInactiveWizards(@Param("tenantId") UUID tenantId, 
                                                @Param("cutoffDate") LocalDateTime cutoffDate, 
                                                @Param("status") OnboardingWizard.Status status);

    @Query("SELECT AVG(w.estimatedDurationMinutes) FROM OnboardingWizard w WHERE w.tenantId = :tenantId AND w.estimatedDurationMinutes IS NOT NULL")
    Double getAverageEstimatedDuration(@Param("tenantId") UUID tenantId);

    @Query("SELECT w FROM OnboardingWizard w WHERE w.tenantId = :tenantId AND w.targetCompletionDate < :now AND w.status != 'COMPLETED'")
    List<OnboardingWizard> findWizardsPastTargetDate(@Param("tenantId") UUID tenantId, @Param("now") LocalDateTime now);

    @Query("SELECT w FROM OnboardingWizard w WHERE w.tenantId = :tenantId AND w.tags LIKE %:tag%")
    List<OnboardingWizard> findByTenantIdAndTagContaining(@Param("tenantId") UUID tenantId, @Param("tag") String tag);
}
