package com.everx.workflow.repository;

import com.everx.workflow.entity.WorkflowStepExecution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface WorkflowStepExecutionRepository extends JpaRepository<WorkflowStepExecution, UUID> {

    List<WorkflowStepExecution> findByWorkflowExecutionIdOrderByStepOrderAsc(UUID workflowExecutionId);

    List<WorkflowStepExecution> findByWorkflowExecutionIdAndStatus(UUID workflowExecutionId, String status);

    @Query("SELECT w FROM WorkflowStepExecution w WHERE w.workflowExecutionId = :executionId AND w.status = 'RUNNING'")
    List<WorkflowStepExecution> findRunningStepsByExecution(@Param("executionId") UUID executionId);

    @Query("SELECT w FROM WorkflowStepExecution w WHERE w.workflowExecutionId = :executionId AND w.status = 'FAILED' AND w.attemptCount < w.maxAttempts")
    List<WorkflowStepExecution> findRetryableFailedStepsByExecution(@Param("executionId") UUID executionId);

    @Query("SELECT w FROM WorkflowStepExecution w WHERE w.workflowExecutionId = :executionId AND w.status = 'RUNNING' AND w.timeoutAt <= :currentTime")
    List<WorkflowStepExecution> findTimedOutStepsByExecution(@Param("executionId") UUID executionId, @Param("currentTime") LocalDateTime currentTime);

    @Query("SELECT w FROM WorkflowStepExecution w WHERE w.workflowStepId = :stepId ORDER BY w.startedAt DESC")
    List<WorkflowStepExecution> findByWorkflowStepIdOrderByStartedAtDesc(@Param("stepId") UUID stepId);

    @Query("SELECT COUNT(w) FROM WorkflowStepExecution w WHERE w.workflowExecutionId = :executionId AND w.status = 'COMPLETED'")
    long countCompletedStepsByExecution(@Param("executionId") UUID executionId);

    @Query("SELECT COUNT(w) FROM WorkflowStepExecution w WHERE w.workflowExecutionId = :executionId AND w.status = 'FAILED'")
    long countFailedStepsByExecution(@Param("executionId") UUID executionId);

    @Query("SELECT w FROM WorkflowStepExecution w WHERE w.startedAt >= :since AND w.workflowExecutionId = :executionId ORDER BY w.startedAt DESC")
    List<WorkflowStepExecution> findRecentStepExecutions(@Param("since") LocalDateTime since, @Param("executionId") UUID executionId);

    @Query("SELECT w FROM WorkflowStepExecution w WHERE w.errorMessage IS NOT NULL AND w.workflowExecutionId = :executionId ORDER BY w.startedAt DESC")
    List<WorkflowStepExecution> findFailedStepExecutionsByExecution(@Param("executionId") UUID executionId);

    @Query("SELECT w FROM WorkflowStepExecution w WHERE w.status = 'RETRYING' AND w.nextRetryAt <= :currentTime")
    List<WorkflowStepExecution> findStepsReadyForRetry(@Param("currentTime") LocalDateTime currentTime);

    @Query("SELECT COUNT(w) FROM WorkflowStepExecution w WHERE w.workflowExecutionId = :executionId")
    long countStepsByExecution(@Param("executionId") UUID executionId);

    @Query("SELECT w FROM WorkflowStepExecution w WHERE w.workflowExecutionId = :executionId AND w.stepOrder = :stepOrder")
    WorkflowStepExecution findByExecutionIdAndStepOrder(@Param("executionId") UUID executionId, @Param("stepOrder") Integer stepOrder);

    @Query("SELECT w FROM WorkflowStepExecution w WHERE w.workflowExecutionId = :executionId AND w.stepOrder > :stepOrder ORDER BY w.stepOrder ASC")
    List<WorkflowStepExecution> findStepsAfter(@Param("executionId") UUID executionId, @Param("stepOrder") Integer stepOrder);

    @Query("SELECT w FROM WorkflowStepExecution w WHERE w.workflowExecutionId = :executionId AND w.durationMs > :minDuration ORDER BY w.durationMs DESC")
    List<WorkflowStepExecution> findSlowestStepsByExecution(@Param("executionId") UUID executionId, @Param("minDuration") Long minDuration);

    @Query("SELECT AVG(w.durationMs) FROM WorkflowStepExecution w WHERE w.workflowStepId = :stepId AND w.status = 'COMPLETED'")
    Double getAverageStepExecutionTime(@Param("stepId") UUID stepId);

    @Query("SELECT w.status, COUNT(w) FROM WorkflowStepExecution w WHERE w.workflowExecutionId = :executionId GROUP BY w.status")
    List<Object[]> getStepExecutionStatusCounts(@Param("executionId") UUID executionId);

    @Query("SELECT w FROM WorkflowStepExecution w WHERE w.workflowExecutionId = :executionId AND w.attemptCount > 1 ORDER BY w.attemptCount DESC")
    List<WorkflowStepExecution> findStepsWithRetriesByExecution(@Param("executionId") UUID executionId);

    @Query("SELECT w FROM WorkflowStepExecution w WHERE w.workflowExecutionId = :executionId AND w.status = 'SKIPPED' ORDER BY w.stepOrder ASC")
    List<WorkflowStepExecution> findSkippedStepsByExecution(@Param("executionId") UUID executionId);

    @Query("SELECT w FROM WorkflowStepExecution w WHERE w.workflowExecutionId = :executionId AND w.logs IS NOT NULL ORDER BY w.stepOrder ASC")
    List<WorkflowStepExecution> findStepsWithLogsByExecution(@Param("executionId") UUID executionId);
}
