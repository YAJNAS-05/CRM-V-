package com.everx.subscription.repository;

import com.everx.subscription.entity.Subscription;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {

    Optional<Subscription> findByTenantIdAndIsActiveTrue(UUID tenantId);

    boolean existsByTenantIdAndIsActiveTrue(UUID tenantId);

    Page<Subscription> findByStatus(Subscription.SubscriptionStatus status, Pageable pageable);

    long countByStatus(Subscription.SubscriptionStatus status);

    @Query("SELECT s FROM Subscription s WHERE s.status = 'TRIAL' AND s.trialEndDate < :currentDate")
    List<Subscription> findExpiredTrials();

    @Query("SELECT s FROM Subscription s WHERE s.isActive = true AND s.nextBillingDate <= :currentDate")
    List<Subscription> findSubscriptionsNeedingBilling();

    @Query("SELECT COUNT(s) FROM Subscription s WHERE s.tenantId = :tenantId AND s.isActive = true")
    long countActiveSubscriptionsByTenant(@Param("tenantId") UUID tenantId);

    @Query("SELECT s FROM Subscription s WHERE s.subscriptionPlan.id = :planId AND s.isActive = true")
    List<Subscription> findActiveSubscriptionsByPlan(@Param("planId") UUID planId);

    @Query("SELECT s FROM Subscription s WHERE s.tenantId = :tenantId ORDER BY s.createdAt DESC")
    List<Subscription> findByTenantIdOrderByCreatedAtDesc(@Param("tenantId") UUID tenantId);

    @Query("SELECT s FROM Subscription s WHERE s.endDate BETWEEN :startDate AND :endDate")
    List<Subscription> findSubscriptionsExpiringBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT s FROM Subscription s WHERE s.trialEndDate BETWEEN :startDate AND :endDate")
    List<Subscription> findTrialsExpiringBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
