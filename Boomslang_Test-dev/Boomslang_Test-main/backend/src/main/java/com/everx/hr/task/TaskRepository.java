package com.everx.hr.task;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TaskRepository extends JpaRepository<Task, UUID> {

    Optional<Task> findByIdAndIsDeletedFalse(UUID id);

    Page<Task> findByProjectIdAndIsDeletedFalse(UUID projectId, Pageable pageable);

    List<Task> findByProjectIdAndIsDeletedFalse(UUID projectId);

    Page<Task> findByAssigneeIdAndIsDeletedFalse(UUID assigneeId, Pageable pageable);

    Page<Task> findAllByIsDeletedFalse(Pageable pageable);

    @Query("""
            SELECT DISTINCT t FROM Task t
            JOIN Project p ON p.id = t.projectId AND p.isDeleted = false
            LEFT JOIN ProjectMember m ON m.projectId = p.id AND m.isDeleted = false
            WHERE t.isDeleted = false
              AND ((:ownerId IS NOT NULL AND p.ownerId = :ownerId)
                   OR (:employeeId IS NOT NULL AND m.employeeId = :employeeId))
            """)
    Page<Task> findAccessibleTasks(@Param("ownerId") UUID ownerId,
                                  @Param("employeeId") UUID employeeId,
                                  Pageable pageable);
}
