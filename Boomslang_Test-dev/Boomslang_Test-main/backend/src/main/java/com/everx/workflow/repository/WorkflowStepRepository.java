package com.everx.workflow.repository;

import com.everx.workflow.entity.WorkflowStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WorkflowStepRepository extends JpaRepository<WorkflowStep, UUID> {

    List<WorkflowStep> findByWorkflowIdOrderByStepOrderAsc(UUID workflowId);

    @Query("SELECT w FROM WorkflowStep w WHERE w.workflowId = :workflowId AND w.stepType = :stepType ORDER BY w.stepOrder ASC")
    List<WorkflowStep> findByWorkflowIdAndStepType(@Param("workflowId") UUID workflowId, @Param("stepType") String stepType);

    @Query("SELECT w FROM WorkflowStep w WHERE w.workflowId = :workflowId AND w.actionType = :actionType ORDER BY w.stepOrder ASC")
    List<WorkflowStep> findByWorkflowIdAndActionType(@Param("workflowId") UUID workflowId, @Param("actionType") String actionType);

    @Query("SELECT w FROM WorkflowStep w WHERE w.workflowId = :workflowId AND w.isParallel = true ORDER BY w.stepOrder ASC")
    List<WorkflowStep> findParallelStepsByWorkflow(@Param("workflowId") UUID workflowId);

    @Query("SELECT w FROM WorkflowStep w WHERE w.workflowId = :workflowId AND w.isOptional = true ORDER BY w.stepOrder ASC")
    List<WorkflowStep> findOptionalStepsByWorkflow(@Param("workflowId") UUID workflowId);

    @Query("SELECT w FROM WorkflowStep w WHERE w.name ILIKE %:search% AND w.workflowId = :workflowId ORDER BY w.name ASC")
    List<WorkflowStep> searchSteps(@Param("search") String search, @Param("workflowId") UUID workflowId);

    @Query("SELECT COUNT(w) FROM WorkflowStep w WHERE w.workflowId = :workflowId")
    long countStepsByWorkflow(@Param("workflowId") UUID workflowId);

    @Query("SELECT MAX(w.stepOrder) FROM WorkflowStep w WHERE w.workflowId = :workflowId")
    Integer findMaxStepOrderByWorkflow(@Param("workflowId") UUID workflowId);

    @Query("SELECT w FROM WorkflowStep w WHERE w.workflowId = :workflowId AND w.stepOrder > :stepOrder ORDER BY w.stepOrder ASC")
    List<WorkflowStep> findStepsAfter(@Param("workflowId") UUID workflowId, @Param("stepOrder") Integer stepOrder);

    @Query("SELECT w FROM WorkflowStep w WHERE w.workflowId = :workflowId AND w.stepOrder < :stepOrder ORDER BY w.stepOrder DESC")
    List<WorkflowStep> findStepsBefore(@Param("workflowId") UUID workflowId, @Param("stepOrder") Integer stepOrder);

    @Query("SELECT DISTINCT w.stepType FROM WorkflowStep w WHERE w.workflowId = :workflowId ORDER BY w.stepType ASC")
    List<String> findDistinctStepTypesByWorkflow(@Param("workflowId") UUID workflowId);

    @Query("SELECT DISTINCT w.actionType FROM WorkflowStep w WHERE w.workflowId = :workflowId ORDER BY w.actionType ASC")
    List<String> findDistinctActionTypesByWorkflow(@Param("workflowId") UUID workflowId);

    @Query("SELECT w FROM WorkflowStep w WHERE w.workflowId = :workflowId AND w.errorHandling = :errorHandling ORDER BY w.stepOrder ASC")
    List<WorkflowStep> findByWorkflowIdAndErrorHandling(@Param("workflowId") UUID workflowId, @Param("errorHandling") String errorHandling);

    @Query("SELECT w FROM WorkflowStep w WHERE w.workflowId = :workflowId AND w.retryCount > 0 ORDER BY w.stepOrder ASC")
    List<WorkflowStep> findRetryableStepsByWorkflow(@Param("workflowId") UUID workflowId);

    @Query("SELECT w FROM WorkflowStep w WHERE w.workflowId = :workflowId AND w.timeoutSeconds > 0 ORDER BY w.stepOrder ASC")
    List<WorkflowStep> findStepsWithTimeoutByWorkflow(@Param("workflowId") UUID workflowId);

    @Query("SELECT w FROM WorkflowStep w WHERE w.workflowId = :workflowId AND w.conditions IS NOT NULL AND w.conditions != '[]' ORDER BY w.stepOrder ASC")
    List<WorkflowStep> findStepsWithConditionsByWorkflow(@Param("workflowId") UUID workflowId);
}
