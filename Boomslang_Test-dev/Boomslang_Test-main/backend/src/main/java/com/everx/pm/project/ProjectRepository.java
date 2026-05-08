package com.everx.pm.project;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface ProjectRepository extends JpaRepository<Project, UUID> {

    Optional<Project> findByIdAndIsDeletedFalse(UUID id);

    @Query("SELECT p FROM Project p WHERE p.isDeleted = false")
    Page<Project> findAllActive(Pageable pageable);

    @Query("""
            SELECT DISTINCT p FROM Project p
            LEFT JOIN ProjectMember m ON m.projectId = p.id AND m.isDeleted = false
            WHERE p.isDeleted = false
              AND ((:ownerId IS NOT NULL AND p.ownerId = :ownerId)
                   OR (:employeeId IS NOT NULL AND m.employeeId = :employeeId))
            """)
    Page<Project> findAccessibleProjects(@Param("ownerId") UUID ownerId,
                                         @Param("employeeId") UUID employeeId,
                                         Pageable pageable);
}
