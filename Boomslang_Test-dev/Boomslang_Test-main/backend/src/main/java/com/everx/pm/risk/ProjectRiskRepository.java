package com.everx.pm.risk;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProjectRiskRepository extends JpaRepository<ProjectRisk, UUID> {

    Optional<ProjectRisk> findByIdAndIsDeletedFalse(UUID id);

    Page<ProjectRisk> findByProjectIdAndIsDeletedFalse(UUID projectId, Pageable pageable);

    List<ProjectRisk> findByProjectIdAndIsDeletedFalse(UUID projectId);
}
