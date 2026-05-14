package com.everx.project.repository;

import com.everx.project.entity.Sprint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SprintRepository extends JpaRepository<Sprint, UUID> {
    List<Sprint> findByProjectIdAndIsDeletedFalse(UUID projectId);
    List<Sprint> findByProjectIdAndStatus(UUID projectId, String status);
    
    @Query("SELECT s FROM PMSprint s WHERE s.projectId = :projectId AND s.status = 'ACTIVE' AND s.startDate <= :today AND s.endDate >= :today")
    Optional<Sprint> findActiveSprint(@Param("projectId") UUID projectId, @Param("today") LocalDate today);
    
    Optional<Sprint> findByProjectIdAndName(UUID projectId, String name);
}
