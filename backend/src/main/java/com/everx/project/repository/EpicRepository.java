package com.everx.project.repository;

import com.everx.project.entity.Epic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface EpicRepository extends JpaRepository<Epic, UUID> {
    List<Epic> findByProjectIdAndIsDeletedFalse(UUID projectId);
    List<Epic> findByProjectIdAndStatus(UUID projectId, String status);
    List<Epic> findByMilestoneId(UUID milestoneId);
    List<Epic> findByOwnerId(UUID ownerId);
}
