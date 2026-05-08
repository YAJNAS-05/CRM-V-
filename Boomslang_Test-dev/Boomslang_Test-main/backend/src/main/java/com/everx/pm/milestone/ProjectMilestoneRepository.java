package com.everx.pm.milestone;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProjectMilestoneRepository extends JpaRepository<ProjectMilestone, UUID> {

    Optional<ProjectMilestone> findByIdAndIsDeletedFalse(UUID id);

    Page<ProjectMilestone> findByProjectIdAndIsDeletedFalse(UUID projectId, Pageable pageable);

    List<ProjectMilestone> findByProjectIdAndIsDeletedFalse(UUID projectId);
}
