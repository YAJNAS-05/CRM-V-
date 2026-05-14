package com.everx.erp.fieldwork;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FieldJobRepository extends JpaRepository<FieldJob, UUID> {

    @Query("SELECT f FROM FieldJob f WHERE f.isDeleted = false AND f.id = :id")
    Optional<FieldJob> findByIdAndNotDeleted(@Param("id") UUID id);

    @Query("SELECT f FROM FieldJob f WHERE f.isDeleted = false")
    Page<FieldJob> findAllNotDeleted(Pageable pageable);

    @Query("SELECT f FROM FieldJob f WHERE f.isDeleted = false AND f.jobNumber = :jobNumber")
    Optional<FieldJob> findByJobNumber(@Param("jobNumber") String jobNumber);

    @Query("SELECT f FROM FieldJob f WHERE f.isDeleted = false AND f.jobStatus = :status")
    Page<FieldJob> findByStatus(@Param("status") FieldJobStatus status, Pageable pageable);

    @Query("SELECT f FROM FieldJob f WHERE f.isDeleted = false AND f.priority = :priority")
    Page<FieldJob> findByPriority(@Param("priority") JobPriority priority, Pageable pageable);

    @Query("SELECT f FROM FieldJob f WHERE f.isDeleted = false AND f.primaryEngineerId = :engineerId")
    Page<FieldJob> findByPrimaryEngineer(@Param("engineerId") UUID engineerId, Pageable pageable);

    @Query("SELECT f FROM FieldJob f WHERE f.isDeleted = false AND f.jobStatus NOT IN ('COMPLETED', 'CANCELLED')")
    List<FieldJob> findOpenJobs();

    long countByCreatedByAndIsDeletedFalse(UUID createdBy);
}
