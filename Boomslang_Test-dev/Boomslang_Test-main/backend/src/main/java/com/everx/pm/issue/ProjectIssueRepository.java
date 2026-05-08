package com.everx.pm.issue;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProjectIssueRepository extends JpaRepository<ProjectIssue, UUID> {

    Optional<ProjectIssue> findByIdAndIsDeletedFalse(UUID id);

    Page<ProjectIssue> findByProjectIdAndIsDeletedFalse(UUID projectId, Pageable pageable);

    List<ProjectIssue> findByProjectIdAndIsDeletedFalse(UUID projectId);
}
