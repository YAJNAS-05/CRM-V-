package com.everx.api.repository;

import com.everx.api.entity.ApiKey;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ApiKeyRepository extends JpaRepository<ApiKey, UUID> {

    Optional<ApiKey> findByKeyValue(String keyValue);

    List<ApiKey> findByTenantIdOrderByCreatedAtDesc(UUID tenantId);

    @Query("SELECT a FROM ApiKey a WHERE a.name ILIKE %:search% OR a.description ILIKE %:search% ORDER BY a.createdAt DESC")
    Page<ApiKey> searchApiKeys(@Param("search") String search, Pageable pageable);

    @Query("SELECT a FROM ApiKey a WHERE a.expiresAt < :currentDate AND a.isActive = true")
    List<ApiKey> findExpiredKeys();

    @Query("SELECT a FROM ApiKey a WHERE a.tenantId = :tenantId AND a.isActive = true AND (a.expiresAt IS NULL OR a.expiresAt > :currentDate)")
    List<ApiKey> findActiveKeysByTenant(@Param("tenantId") UUID tenantId, @Param("currentDate") LocalDateTime currentDate);

    @Query("SELECT COUNT(a) FROM ApiKey a WHERE a.tenantId = :tenantId AND a.isActive = true")
    long countActiveKeysByTenant(@Param("tenantId") UUID tenantId);

    @Query("SELECT a FROM ApiKey a WHERE a.lastUsedAt < :cutoffDate AND a.isActive = true")
    List<ApiKey> findInactiveKeys(@Param("cutoffDate") LocalDateTime cutoffDate);

    @Query("SELECT a FROM ApiKey a WHERE a.keyType = :keyType AND a.isActive = true")
    List<ApiKey> findByKeyType(@Param("keyType") ApiKey.KeyType keyType);

    @Query("SELECT a FROM ApiKey a WHERE a.isReadonly = true AND a.isActive = true")
    List<ApiKey> findReadonlyKeys();

    @Modifying
    @Query("UPDATE ApiKey a SET a.usageCount = a.usageCount + 1, a.lastUsedAt = :currentTime WHERE a.id = :apiKeyId")
    void incrementUsageCount(@Param("apiKeyId") UUID apiKeyId, @Param("currentTime") LocalDateTime currentTime);

    @Query("SELECT COUNT(a) FROM ApiKey a WHERE a.isActive = true")
    long countActiveKeys();

    @Query("SELECT COUNT(a) FROM ApiKey a WHERE a.isActive = true AND a.isRevoked = false")
    long countValidKeys();
}
