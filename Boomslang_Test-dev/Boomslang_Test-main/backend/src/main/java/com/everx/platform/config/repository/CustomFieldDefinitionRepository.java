package com.everx.platform.config.repository;

import com.everx.platform.config.entity.CustomFieldDefinition;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CustomFieldDefinitionRepository extends JpaRepository<CustomFieldDefinition, UUID> {

    Optional<CustomFieldDefinition> findByModuleAndEntityAndFieldKeyAndIsDeletedFalse(
            String module, String entity, String fieldKey);

    List<CustomFieldDefinition> findByModuleAndEntityAndIsDeletedFalseOrderBySortOrderAsc(
            String module, String entity);

    List<CustomFieldDefinition> findByModuleAndEntityAndIsActiveTrueAndIsDeletedFalseOrderBySortOrderAsc(
            String module, String entity);
}
