package com.everx.erp.mapping;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ERPFieldMappingRepository extends JpaRepository<ERPFieldMapping, UUID> {

    @Query("SELECT m FROM ERPFieldMapping m WHERE m.sourceModule = ?1 AND m.targetModule = ?2 AND m.isDeleted = false AND m.isActive = true")
    List<ERPFieldMapping> findMappingsBySourceAndTarget(String sourceModule, String targetModule);

    @Query("SELECT m FROM ERPFieldMapping m WHERE m.sourceModule = ?1 AND m.isDeleted = false AND m.isActive = true")
    List<ERPFieldMapping> findMappingsBySourceModule(String sourceModule);

    @Query("SELECT m FROM ERPFieldMapping m WHERE m.sourceModule = ?1 AND m.targetModule = ?2 AND m.sourceField = ?3 AND m.isDeleted = false")
    Optional<ERPFieldMapping> findMapping(String sourceModule, String targetModule, String sourceField);

    @Query("SELECT DISTINCT m.targetModule FROM ERPFieldMapping m WHERE m.sourceModule = ?1 AND m.isDeleted = false AND m.isActive = true")
    List<String> findTargetModulesForSource(String sourceModule);

    @Query("SELECT m FROM ERPFieldMapping m WHERE m.isRequired = true AND m.isDeleted = false AND m.isActive = true")
    List<ERPFieldMapping> findRequiredMappings();

    @Query("SELECT m FROM ERPFieldMapping m WHERE m.isDeleted = false AND m.isActive = true ORDER BY m.sourceModule, m.targetModule")
    Page<ERPFieldMapping> findAllActiveMappings(Pageable pageable);

    @Query("SELECT m FROM ERPFieldMapping m WHERE m.sourceModule = ?1 AND m.isRequired = true AND m.isDeleted = false AND m.isActive = true")
    List<ERPFieldMapping> findRequiredMappingsBySourceModule(String sourceModule);
}
