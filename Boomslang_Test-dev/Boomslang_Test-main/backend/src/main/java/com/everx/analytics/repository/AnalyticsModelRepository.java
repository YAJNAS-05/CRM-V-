package com.everx.analytics.repository;

import com.everx.analytics.entity.AnalyticsModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AnalyticsModelRepository extends JpaRepository<AnalyticsModel, UUID> {
    
    Optional<AnalyticsModel> findByModelTypeAndIsActive(String modelType, Boolean isActive);
    
    List<AnalyticsModel> findByIsActive(Boolean isActive);
    
    List<AnalyticsModel> findByTenantId(UUID tenantId);
    
    List<AnalyticsModel> findByTenantIdAndIsActive(UUID tenantId, Boolean isActive);
    
    @Query("SELECT m FROM AnalyticsModel m WHERE m.tenantId = :tenantId AND m.modelType = :modelType AND m.isActive = true")
    Optional<AnalyticsModel> findActiveModelByTypeAndTenant(@Param("tenantId") UUID tenantId, 
                                                           @Param("modelType") String modelType);
    
    @Query("SELECT COUNT(m) FROM AnalyticsModel m WHERE m.tenantId = :tenantId AND m.isActive = true")
    Long countActiveModelsByTenant(@Param("tenantId") UUID tenantId);
}
