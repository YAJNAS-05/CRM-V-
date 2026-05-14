package com.everx.hr.project;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProjectCostRepository extends JpaRepository<ProjectCost, UUID> {

    List<ProjectCost> findByProjectIdAndIsDeletedFalse(UUID projectId);
}
