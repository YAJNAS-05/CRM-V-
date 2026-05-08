package com.everx.workflow.repository;

import com.everx.workflow.entity.Workflow;
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
public interface WorkflowRepository extends JpaRepository<Workflow, UUID> {

    List<Workflow> findByTenantIdOrderByCreatedAtDesc(UUID tenantId);

    @Query("SELECT w FROM Workflow w WHERE w.tenantId = :tenantId AND w.createdByUserId = :userId ORDER BY w.createdAt DESC")
    List<Workflow> findByTenantIdAndCreatedByUserId(@Param("tenantId") UUID tenantId, @Param("userId") UUID userId);

    Page<Workflow> findByStatus(String status, Pageable pageable);

    @Query("SELECT w FROM Workflow w WHERE w.tenantId = :tenantId AND w.category = :category ORDER BY w.name ASC")
    List<Workflow> findByTenantIdAndCategory(@Param("tenantId") UUID tenantId, @Param("category") String category);

    @Query("SELECT w FROM Workflow w WHERE w.tenantId = :tenantId AND w.triggerType = :triggerType ORDER BY w.name ASC")
    List<Workflow> findByTenantIdAndTriggerType(@Param("tenantId") UUID tenantId, @Param("triggerType") String triggerType);

    @Query("SELECT w FROM Workflow w WHERE w.name ILIKE %:search% AND w.tenantId = :tenantId ORDER BY w.name ASC")
    List<Workflow> searchWorkflows(@Param("search") String search, @Param("tenantId") UUID tenantId);

    @Query("SELECT w FROM Workflow w WHERE w.isActive = true AND w.isPublished = true AND w.triggerType = 'SCHEDULED' AND w.nextExecutionAt <= :currentTime")
    List<Workflow> findScheduledWorkflowsReadyToExecute(@Param("currentTime") LocalDateTime currentTime);

    @Query("SELECT COUNT(w) FROM Workflow w WHERE w.tenantId = :tenantId AND w.isActive = true")
    long countActiveWorkflowsByTenant(@Param("tenantId") UUID tenantId);

    @Query("SELECT COUNT(w) FROM Workflow w WHERE w.tenantId = :tenantId AND w.isPublished = true")
    long countPublishedWorkflowsByTenant(@Param("tenantId") UUID tenantId);

    @Query("SELECT w FROM Workflow w WHERE w.lastExecutedAt >= :since AND w.tenantId = :tenantId ORDER BY w.lastExecutedAt DESC")
    List<Workflow> findRecentlyExecutedWorkflows(@Param("since") LocalDateTime since, @Param("tenantId") UUID tenantId);

    @Query("SELECT w FROM Workflow w WHERE w.executionCount >= :minExecutions AND w.tenantId = :tenantId ORDER BY w.executionCount DESC")
    List<Workflow> findMostExecutedWorkflows(@Param("minExecutions") Long minExecutions, @Param("tenantId") UUID tenantId);

    @Query("SELECT w FROM Workflow w WHERE w.failureCount > 0 AND w.tenantId = :tenantId ORDER BY w.failureCount DESC")
    List<Workflow> findWorkflowsWithFailures(@Param("tenantId") UUID tenantId);

    @Query("SELECT DISTINCT w.category FROM Workflow w WHERE w.tenantId = :tenantId AND w.category IS NOT NULL ORDER BY w.category ASC")
    List<String> findDistinctCategoriesByTenant(@Param("tenantId") UUID tenantId);

    @Query("SELECT DISTINCT w.triggerType FROM Workflow w WHERE w.tenantId = :tenantId ORDER BY w.triggerType ASC")
    List<String> findDistinctTriggerTypesByTenant(@Param("tenantId") UUID tenantId);

    @Query("SELECT w FROM Workflow w WHERE w.tags ILIKE %:tag% AND w.tenantId = :tenantId ORDER BY w.name ASC")
    List<Workflow> findByTag(@Param("tag") String tag, @Param("tenantId") UUID tenantId);

    @Query("SELECT w FROM Workflow w WHERE w.isActive = true AND w.isPublished = true AND w.triggerType = 'EVENT' ORDER BY w.name ASC")
    List<Workflow> findActiveEventTriggeredWorkflows();

    @Query("SELECT w FROM Workflow w WHERE w.isActive = true AND w.isPublished = true AND w.triggerType = 'WEBHOOK' ORDER BY w.name ASC")
    List<Workflow> findActiveWebhookTriggeredWorkflows();
}
