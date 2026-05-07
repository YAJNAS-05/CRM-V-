package com.everx.platform.config.repository;

import com.everx.platform.config.entity.CustomFieldDefinition;
import com.everx.platform.config.entity.CustomFieldValue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CustomFieldValueRepository extends JpaRepository<CustomFieldValue, UUID> {

    List<CustomFieldValue> findByDefinitionInAndEntityIdAndIsDeletedFalse(
            List<CustomFieldDefinition> definitions, String entityId);

    Optional<CustomFieldValue> findByDefinitionAndEntityIdAndIsDeletedFalse(
            CustomFieldDefinition definition, String entityId);
}
