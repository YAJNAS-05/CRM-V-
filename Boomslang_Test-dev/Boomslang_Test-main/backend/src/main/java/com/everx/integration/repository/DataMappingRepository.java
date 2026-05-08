package com.everx.integration.repository;

import com.everx.integration.entity.DataMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface DataMappingRepository extends JpaRepository<DataMapping, UUID> {

    List<DataMapping> findByTenantId(UUID tenantId);

    List<DataMapping> findByTenantIdAndIsActive(UUID tenantId, Boolean isActive);

    List<DataMapping> findByTenantIdAndSourceEntityType(UUID tenantId, String sourceEntityType);

    List<DataMapping> findByTenantIdAndTargetEntityType(UUID tenantId, String targetEntityType);

    @Query("SELECT m FROM DataMapping m WHERE m.tenantId = :tenantId AND m.sourceEntityType = :sourceType AND m.targetEntityType = :targetType")
    List<DataMapping> findByTenantIdAndSourceEntityTypeAndTargetEntityType(@Param("tenantId") UUID tenantId, 
                                                                            @Param("sourceType") String sourceEntityType, 
                                                                            @Param("targetType") String targetEntityType);

    @Query("SELECT COUNT(m) FROM DataMapping m WHERE m.tenantId = :tenantId AND m.isActive = true")
    long countByTenantIdAndIsActive(@Param("tenantId") UUID tenantId, Boolean isActive);

    @Query("SELECT COUNT(m) FROM DataMapping m WHERE m.tenantId = :tenantId")
    long countByTenantId(@Param("tenantId") UUID tenantId);

    @Query("SELECT m FROM DataMapping m WHERE m.tenantId = :tenantId AND m.createdBy = :createdBy")
    List<DataMapping> findByTenantIdAndCreatedBy(@Param("tenantId") UUID tenantId, @Param("createdBy") String createdBy);

    @Query("SELECT m FROM DataMapping m WHERE m.tenantId = :tenantId AND m.lastUsedAt BETWEEN :startDate AND :endDate")
    List<DataMapping> findByTenantIdAndLastUsedAtBetween(@Param("tenantId") UUID tenantId, 
                                                         @Param("startDate") LocalDateTime startDate, 
                                                         @Param("endDate") LocalDateTime endDate);

    @Query("SELECT m FROM DataMapping m WHERE m.tenantId = :tenantId AND m.isDefault = true")
    List<DataMapping> findDefaultMappings(@Param("tenantId") UUID tenantId);

    @Query("SELECT m FROM DataMapping m WHERE m.tenantId = :tenantId AND m.sourceSystem = :sourceSystem")
    List<DataMapping> findByTenantIdAndSourceSystem(@Param("tenantId") UUID tenantId, @Param("sourceSystem") String sourceSystem);

    @Query("SELECT m FROM DataMapping m WHERE m.tenantId = :tenantId AND m.targetSystem = :targetSystem")
    List<DataMapping> findByTenantIdAndTargetSystem(@Param("tenantId") UUID tenantId, @Param("targetSystem") String targetSystem);

    @Query("SELECT m FROM DataMapping m WHERE m.tenantId = :tenantId AND m.category = :category")
    List<DataMapping> findByTenantIdAndCategory(@Param("tenantId") UUID tenantId, @Param("category") String category);

    @Query("SELECT m FROM DataMapping m WHERE m.tenantId = :tenantId AND m.priority >= :minPriority ORDER BY m.priority DESC")
    List<DataMapping> findByTenantIdAndPriorityGreaterThanEqualOrderByPriorityDesc(@Param("tenantId") UUID tenantId, 
                                                                                   @Param("minPriority") Integer minPriority);

    @Query("SELECT AVG(m.successRate) FROM DataMapping m WHERE m.tenantId = :tenantId AND m.usageCount > 0")
    Double getAverageSuccessRate(@Param("tenantId") UUID tenantId);

    @Query("SELECT m.sourceEntityType, COUNT(m) FROM DataMapping m WHERE m.tenantId = :tenantId GROUP BY m.sourceEntityType")
    List<Object[]> getSourceEntityTypeStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT m.targetEntityType, COUNT(m) FROM DataMapping m WHERE m.tenantId = :tenantId GROUP BY m.targetEntityType")
    List<Object[]> getTargetEntityTypeStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT m.category, COUNT(m) FROM DataMapping m WHERE m.tenantId = :tenantId AND m.category IS NOT NULL GROUP BY m.category")
    List<Object[]> getCategoryStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT m FROM DataMapping m WHERE m.tenantId = :tenantId AND m.name LIKE %:name%")
    List<DataMapping> findByTenantIdAndNameContaining(@Param("tenantId") UUID tenantId, @Param("name") String name);

    @Query("SELECT SUM(m.usageCount) FROM DataMapping m WHERE m.tenantId = :tenantId")
    Long getTotalUsageCount(@Param("tenantId") UUID tenantId);

    @Query("SELECT SUM(m.successCount) FROM DataMapping m WHERE m.tenantId = :tenantId")
    Long getTotalSuccessCount(@Param("tenantId") UUID tenantId);

    @Query("SELECT SUM(m.failureCount) FROM DataMapping m WHERE m.tenantId = :tenantId")
    Long getTotalFailureCount(@Param("tenantId") UUID tenantId);

    @Query("SELECT m FROM DataMapping m WHERE m.tenantId = :tenantId AND m.version > :minVersion")
    List<DataMapping> findByTenantIdAndVersionGreaterThan(@Param("tenantId") UUID tenantId, @Param("minVersion") Integer minVersion);

    @Query("SELECT m FROM DataMapping m WHERE m.tenantId = :tenantId AND m.lastUsedAt < :cutoffDate AND m.usageCount < :minUsage")
    List<DataMapping> findUnusedMappings(@Param("tenantId") UUID tenantId, @Param("cutoffDate") LocalDateTime cutoffDate, @Param("minUsage") Long minUsage);

    @Query("SELECT m FROM DataMapping m WHERE m.tenantId = :tenantId AND m.hasValidationRules = true")
    List<DataMapping> findMappingsWithValidationRules(@Param("tenantId") UUID tenantId);

    @Query("SELECT m FROM DataMapping m WHERE m.tenantId = :tenantId AND m.hasTransformationLogic = true")
    List<DataMapping> findMappingsWithTransformationLogic(@Param("tenantId") UUID tenantId);

    @Query("SELECT m FROM DataMapping m WHERE m.tenantId = :tenantId AND m.hasFieldMappings = true")
    List<DataMapping> findMappingsWithFieldMappings(@Param("tenantId") UUID tenantId);

    @Query("SELECT COUNT(m) FROM DataMapping m WHERE m.tenantId = :tenantId AND m.sourceEntityType = :sourceType AND m.targetEntityType = :targetType AND m.isActive = true")
    long countByTenantIdAndSourceEntityTypeAndTargetEntityTypeAndIsActive(@Param("tenantId") UUID tenantId, 
                                                                          @Param("sourceType") String sourceEntityType, 
                                                                          @Param("targetType") String targetEntityType, 
                                                                          Boolean isActive);
}
