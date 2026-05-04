package com.everx.hr.training;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TrainingEnrollmentRepository extends JpaRepository<TrainingEnrollment, UUID> {

    @Query("SELECT e FROM TrainingEnrollment e WHERE e.isDeleted = false AND e.trainingId = :trainingId")
    List<TrainingEnrollment> findByTrainingId(@Param("trainingId") UUID trainingId);

    @Query("SELECT e FROM TrainingEnrollment e WHERE e.isDeleted = false AND e.employeeId = :employeeId")
    List<TrainingEnrollment> findByEmployeeId(@Param("employeeId") UUID employeeId);

    @Query("SELECT e FROM TrainingEnrollment e WHERE e.isDeleted = false AND e.trainingId = :trainingId AND e.employeeId = :employeeId")
    Optional<TrainingEnrollment> findByTrainingIdAndEmployeeId(@Param("trainingId") UUID trainingId, @Param("employeeId") UUID employeeId);

    boolean existsByTrainingIdAndEmployeeIdAndIsDeleted(UUID trainingId, UUID employeeId, Boolean isDeleted);
}
