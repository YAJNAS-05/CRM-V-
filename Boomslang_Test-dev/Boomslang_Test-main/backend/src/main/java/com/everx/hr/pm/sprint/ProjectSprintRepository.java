package com.everx.hr.pm.sprint;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProjectSprintRepository extends JpaRepository<ProjectSprint, UUID> {

    Optional<ProjectSprint> findByIdAndIsDeletedFalse(UUID id);

    Page<ProjectSprint> findByProjectIdAndIsDeletedFalse(UUID projectId, Pageable pageable);

    List<ProjectSprint> findByProjectIdAndIsDeletedFalse(UUID projectId);
}
