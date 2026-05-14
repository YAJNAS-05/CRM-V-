package com.everx.hr.task;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TaskRepository extends JpaRepository<Task, UUID> {

    Optional<Task> findByIdAndIsDeletedFalse(UUID id);

    Page<Task> findByProjectIdAndIsDeletedFalse(UUID projectId, Pageable pageable);

    List<Task> findByProjectIdAndIsDeletedFalse(UUID projectId);

    Page<Task> findByAssigneeIdAndIsDeletedFalse(UUID assigneeId, Pageable pageable);

    Page<Task> findAllByIsDeletedFalse(Pageable pageable);
}
