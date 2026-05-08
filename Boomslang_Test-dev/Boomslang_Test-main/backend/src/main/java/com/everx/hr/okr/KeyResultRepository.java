package com.everx.hr.okr;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface KeyResultRepository extends JpaRepository<KeyResult, UUID> {

    @Query("SELECT kr FROM KeyResult kr WHERE kr.isDeleted = false AND kr.id = :id")
    Optional<KeyResult> findByIdActive(@Param("id") UUID id);

    @Query("SELECT kr FROM KeyResult kr WHERE kr.isDeleted = false AND kr.objectiveId = :objectiveId ORDER BY kr.createdAt ASC")
    List<KeyResult> findByObjectiveId(@Param("objectiveId") UUID objectiveId);

    @Query("SELECT kr FROM KeyResult kr WHERE kr.isDeleted = false AND kr.status = :status ORDER BY kr.createdAt DESC")
    List<KeyResult> findByStatus(@Param("status") String status);

    @Query("SELECT AVG(kr.progressPercent) FROM KeyResult kr WHERE kr.isDeleted = false AND kr.objectiveId = :objectiveId")
    Double calculateAverageProgressByObjectiveId(@Param("objectiveId") UUID objectiveId);

    @Query("SELECT COUNT(kr) FROM KeyResult kr WHERE kr.isDeleted = false AND kr.objectiveId = :objectiveId AND kr.status = 'COMPLETED'")
    long countCompletedByObjectiveId(@Param("objectiveId") UUID objectiveId);

    @Query("SELECT COUNT(kr) FROM KeyResult kr WHERE kr.isDeleted = false AND kr.objectiveId = :objectiveId")
    long countByObjectiveId(@Param("objectiveId") UUID objectiveId);
}
