package com.everx.platform.config.repository;

import com.everx.platform.config.entity.WorkflowDefinition;
import com.everx.platform.config.entity.WorkflowTransition;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface WorkflowTransitionRepository extends JpaRepository<WorkflowTransition, UUID> {

    List<WorkflowTransition> findByWorkflowDefinitionAndIsDeletedFalseOrderByFromStatusAsc(WorkflowDefinition workflowDefinition);

    List<WorkflowTransition> findByWorkflowDefinitionAndIsActiveTrueAndIsDeletedFalseOrderByFromStatusAsc(WorkflowDefinition workflowDefinition);
}
