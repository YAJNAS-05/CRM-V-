package com.everx.project.repository;

import com.everx.project.entity.Milestone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface MilestoneRepository extends JpaRepository<Milestone, UUID> {
    List<Milestone> findByProjectIdAndIsDeletedFalse(UUID projectId);
    List<Milestone> findByProjectIdOrderByDueDateAsc(UUID projectId);
    List<Milestone> findByOwnerId(UUID ownerId);
    List<Milestone> findByStatus(String status);
}
