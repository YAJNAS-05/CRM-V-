package com.everx.project.repository;

import com.everx.project.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PMTaskRepository extends JpaRepository<Task, UUID> {
    List<Task> findByProjectIdAndIsDeletedFalse(UUID projectId);
    List<Task> findByProjectIdAndStatusAndIsDeletedFalse(UUID projectId, String status);
    List<Task> findByAssigneeIdAndIsDeletedFalse(UUID assigneeId);
    List<Task> findByEpicIdAndIsDeletedFalse(UUID epicId);
    List<Task> findBySprintIdAndIsDeletedFalse(UUID sprintId);
    List<Task> findByMilestoneIdAndIsDeletedFalse(UUID milestoneId);
    List<Task> findByParentTaskIdAndIsDeletedFalse(UUID parentTaskId);
    
    Optional<Task> findByProjectIdAndTaskNumber(UUID projectId, String taskNumber);
    
    @Query("SELECT COALESCE(MAX(CAST(SUBSTRING(t.taskNumber, 6, 5) AS integer)), 0) FROM PMTask t WHERE t.projectId = :projectId")
    Optional<Integer> findMaxTaskNumberByProjectId(@Param("projectId") UUID projectId);
    
    @Query("SELECT t FROM PMTask t WHERE t.assigneeId = :userId AND t.isDeleted = false AND t.dueDate < CURRENT_DATE AND t.status != 'DONE'")
    List<Task> findOverdueTasksByUserId(@Param("userId") UUID userId);
    
    long countByProjectIdAndStatusAndIsDeletedFalse(UUID projectId, String status);
}
