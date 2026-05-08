package com.everx.workflow.repository;

import com.everx.workflow.entity.WorkflowExecution;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface WorkflowExecutionRepository extends JpaRepository<WorkflowExecution, UUID> {

    List<WorkflowExecution> findByWorkflowIdOrderByStartedAtDesc(UUID workflowId);

    Page<WorkflowExecution> findByStatus(String status, Pageable pageable);

    @Query("SELECT w FROM WorkflowExecution w WHERE w.status = :status ORDER BY w.scheduledAt ASC")
    List<WorkflowExecution> findByStatusOrderByScheduledAtAsc(@Param("status") String status);

    @Query("SELECT w FROM WorkflowExecution w WHERE w.status = :status AND w.nextRetryAt <= :currentTime")
    List<WorkflowExecution> findByStatusAndNextRetryAtBefore(@Param("status") String status, @Param("currentTime") LocalDateTime currentTime);

    @Query("SELECT w FROM WorkflowExecution w WHERE w.workflowId = :workflowId AND w.status = :status ORDER BY w.startedAt DESC")
    List<WorkflowExecution> findByWorkflowIdAndStatus(@Param("workflowId") UUID workflowId, @Param("status") String status);

    @Query("SELECT w FROM WorkflowExecution w WHERE w.triggeredBy = :triggeredBy ORDER BY w.startedAt DESC")
    List<WorkflowExecution> findByTriggeredBy(@Param("triggeredBy") String triggeredBy);

    @Query("SELECT w FROM WorkflowExecution w WHERE w.startedAt >= :since AND w.workflowId = :workflowId ORDER BY w.startedAt DESC")
    List<WorkflowExecution> findRecentExecutions(@Param("since") LocalDateTime since, @Param("workflowId") UUID workflowId);

    @Query("SELECT w FROM WorkflowExecution w WHERE w.startedAt >= :since AND w.tenantId = :tenantId ORDER BY w.startedAt DESC")
    List<WorkflowExecution> findRecentExecutionsByTenant(@Param("since") LocalDateTime since, @Param("tenantId") UUID tenantId);

    @Query("SELECT w FROM WorkflowExecution w WHERE w.status = 'RUNNING' AND w.timeoutAt <= :currentTime")
    List<WorkflowExecution> findTimedOutExecutions(@Param("currentTime") LocalDateTime currentTime);

    @Query("SELECT COUNT(w) FROM WorkflowExecution w WHERE w.workflowId = :workflowId AND w.status = 'COMPLETED'")
    long countCompletedExecutionsByWorkflow(@Param("workflowId") UUID workflowId);

    @Query("SELECT COUNT(w) FROM WorkflowExecution w WHERE w.workflowId = :workflowId AND w.status = 'FAILED'")
    long countFailedExecutionsByWorkflow(@Param("workflowId") UUID workflowId);

    @Query("SELECT w FROM WorkflowExecution w WHERE w.durationMs > :minDuration ORDER BY w.durationMs DESC")
    List<WorkflowExecution> findLongestRunningExecutions(@Param("minDuration") Long minDuration);

    @Query("SELECT w FROM WorkflowExecution w WHERE w.errorMessage IS NOT NULL AND w.workflowId = :workflowId ORDER BY w.startedAt DESC")
    List<WorkflowExecution> findFailedExecutionsByWorkflow(@Param("workflowId") UUID workflowId);

    @Query("SELECT w FROM WorkflowExecution w WHERE w.priority > :minPriority ORDER BY w.priority DESC, w.scheduledAt ASC")
    List<WorkflowExecution> findHighPriorityExecutions(@Param("minPriority") Integer minPriority);

    @Query("SELECT COUNT(w) FROM WorkflowExecution w WHERE w.status = 'RUNNING'")
    long countRunningExecutions();

    @Query("SELECT COUNT(w) FROM WorkflowExecution w WHERE w.status = 'PENDING'")
    long countPendingExecutions();

    @Query("SELECT COUNT(w) FROM WorkflowExecution w WHERE w.status = 'FAILED' AND w.retryCount < w.maxRetries")
    long countRetryableFailedExecutions();

    @Query("SELECT w FROM WorkflowExecution w WHERE w.executionId = :executionId")
    WorkflowExecution findByExecutionId(@Param("executionId") String executionId);

    @Query("SELECT w FROM WorkflowExecution w WHERE w.startedAt >= :startDate AND w.startedAt <= :endDate ORDER BY w.startedAt DESC")
    List<WorkflowExecution> findExecutionsInDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT w FROM WorkflowExecution w WHERE w.workflowId = :workflowId AND w.startedAt >= :startDate AND w.startedAt <= :endDate ORDER BY w.startedAt DESC")
    List<WorkflowExecution> findExecutionsByWorkflowInDateRange(@Param("workflowId") UUID workflowId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT AVG(w.durationMs) FROM WorkflowExecution w WHERE w.workflowId = :workflowId AND w.status = 'COMPLETED'")
    Double getAverageExecutionTimeByWorkflow(@Param("workflowId") UUID workflowId);

    @Query("SELECT w.status, COUNT(w) FROM WorkflowExecution w WHERE w.workflowId = :workflowId GROUP BY w.status")
    List<Object[]> getExecutionStatusCountsByWorkflow(@Param("workflowId") UUID workflowId);
}
