package com.everx.subscription.repository;

import com.everx.subscription.entity.SubscriptionPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, UUID> {

    Optional<SubscriptionPlan> findByName(String name);

    boolean existsByName(String name);

    List<SubscriptionPlan> findByIsActiveTrueOrderBySortOrderAsc();

    List<SubscriptionPlan> findByIsPublicTrueOrderBySortOrderAsc();

    List<SubscriptionPlan> findByIsEnterpriseTrueOrderBySortOrderAsc();

    List<SubscriptionPlan> findByIsPopularTrueOrderBySortOrderAsc();

    @Query("SELECT p FROM SubscriptionPlan p WHERE p.priceMonthly BETWEEN :minPrice AND :maxPrice AND p.isActive = true ORDER BY p.priceMonthly ASC")
    List<SubscriptionPlan> findByPriceRange(@Param("minPrice") java.math.BigDecimal minPrice, @Param("maxPrice") java.math.BigDecimal maxPrice);

    @Query("SELECT p FROM SubscriptionPlan p WHERE p.maxUsers >= :minUsers AND p.isActive = true ORDER BY p.maxUsers ASC")
    List<SubscriptionPlan> findByMinUsers(@Param("minUsers") Integer minUsers);

    @Query("SELECT p FROM SubscriptionPlan p WHERE p.maxStorageGb >= :minStorage AND p.isActive = true ORDER BY p.maxStorageGb ASC")
    List<SubscriptionPlan> findByMinStorage(@Param("minStorage") Integer minStorage);

    @Query("SELECT COUNT(p) FROM SubscriptionPlan p WHERE p.isActive = true")
    long countActivePlans();

    @Query("SELECT COUNT(p) FROM SubscriptionPlan p WHERE p.isActive = true AND p.isPublic = true")
    long countPublicPlans();
}
