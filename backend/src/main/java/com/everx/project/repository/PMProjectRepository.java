package com.everx.project.repository;

import com.everx.project.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface PMProjectRepository extends JpaRepository<Project, UUID> {
    List<Project> findByWorkspaceIdAndIsDeletedFalse(UUID workspaceId);
    List<Project> findByPortfolioIdAndIsDeletedFalse(UUID portfolioId);
    List<Project> findByStatusAndIsDeletedFalse(String status);
    List<Project> findByOwnerId(UUID ownerId);
    List<Project> findByIsArchivedFalseAndIsDeletedFalse();
}
