package com.everx.platform.config.repository;

import com.everx.platform.config.entity.WorkflowDefinition;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WorkflowDefinitionRepository extends JpaRepository<WorkflowDefinition, UUID> {

    Optional<WorkflowDefinition> findByModuleAndEntityAndIsDefaultTrueAndIsDeletedFalse(String module, String entity);

    List<WorkflowDefinition> findByModuleAndEntityAndIsDeletedFalseOrderByNameAsc(String module, String entity);
}
