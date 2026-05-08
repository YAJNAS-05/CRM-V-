package com.everx.tenant.repository;

import com.everx.tenant.entity.Tenant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TenantRepository extends JpaRepository<Tenant, UUID> {

    Optional<Tenant> findBySubdomain(String subdomain);

    Optional<Tenant> findByCustomDomain(String customDomain);

    Optional<Tenant> findBySubdomainOrCustomDomain(String subdomain, String customDomain);

    boolean existsBySubdomain(String subdomain);

    boolean existsByCustomDomain(String customDomain);

    @Query("SELECT t FROM Tenant t WHERE t.isActive = true AND (t.isTrial = false OR (t.isTrial = true AND t.trialEndDate > :now))")
    List<Tenant> findActiveTenants(@Param("now") LocalDateTime now);

    @Query("SELECT t FROM Tenant t WHERE t.isTrial = true AND t.trialEndDate <= :now AND t.isActive = true")
    List<Tenant> findExpiredTrialTenants(@Param("now") LocalDateTime now);

    @Query("SELECT t FROM Tenant t WHERE t.setupCompleted = false AND t.isActive = true")
    List<Tenant> findIncompleteSetupTenants();

    @Query("SELECT t FROM Tenant t WHERE t.createdByUserId = :userId")
    List<Tenant> findByCreatedByUserId(@Param("userId") UUID userId);

    @Query("SELECT t FROM Tenant t WHERE t.subscriptionPlan = :plan AND t.isActive = true")
    Page<Tenant> findBySubscriptionPlan(@Param("plan") String plan, Pageable pageable);

    @Query("SELECT COUNT(t) FROM Tenant t WHERE t.isActive = true")
    long countActiveTenants();

    @Query("SELECT COUNT(t) FROM Tenant t WHERE t.isTrial = true AND t.trialEndDate > :now")
    long countActiveTrialTenants(@Param("now") LocalDateTime now);

    @Query("SELECT t FROM Tenant t WHERE t.name ILIKE %:search% OR t.subdomain ILIKE %:search% OR t.industry ILIKE %:search%")
    Page<Tenant> searchTenants(@Param("search") String search, Pageable pageable);

    @Query("SELECT t FROM Tenant t WHERE t.isActive = true ORDER BY t.createdAt DESC")
    Page<Tenant> findActiveTenantsOrderByCreatedDate(Pageable pageable);

    @Query("SELECT t FROM Tenant t WHERE t.userCount >= t.maxUsers * 0.9 AND t.isActive = true")
    List<Tenant> findTenantsNearUserLimit();

    @Query("SELECT t FROM Tenant t WHERE t.storageUsedGb >= t.maxStorageGb * 0.9 AND t.isActive = true")
    List<Tenant> findTenantsNearStorageLimit();
}
