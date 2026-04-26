package com.everx.erp.assessment;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface EquipmentAssessmentRepository extends JpaRepository<EquipmentAssessment, UUID> {

    @Query("SELECT e FROM EquipmentAssessment e WHERE e.isDeleted = false AND e.id = :id")
    Optional<EquipmentAssessment> findByIdAndNotDeleted(@Param("id") UUID id);

    @Query("SELECT e FROM EquipmentAssessment e WHERE e.isDeleted = false")
    Page<EquipmentAssessment> findAllNotDeleted(Pageable pageable);

    @Query("SELECT e FROM EquipmentAssessment e WHERE e.isDeleted = false AND e.assessmentNumber = :assessmentNumber")
    Optional<EquipmentAssessment> findByAssessmentNumber(@Param("assessmentNumber") String assessmentNumber);

    @Query("SELECT e FROM EquipmentAssessment e WHERE e.isDeleted = false AND e.acquisitionId = :acquisitionId")
    Page<EquipmentAssessment> findByAcquisitionId(@Param("acquisitionId") UUID acquisitionId, Pageable pageable);

    @Query("SELECT e FROM EquipmentAssessment e WHERE e.isDeleted = false AND e.outcome = :outcome")
    Page<EquipmentAssessment> findByOutcome(@Param("outcome") String outcome, Pageable pageable);
}
