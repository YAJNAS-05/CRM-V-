package com.everx.hr.document;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface HrDocumentRepository extends JpaRepository<HrDocument, UUID> {

    @Query("SELECT d FROM HrDocument d WHERE d.isDeleted = false AND d.id = :id")
    Optional<HrDocument> findByIdAndNotDeleted(@Param("id") UUID id);

    @Query("SELECT d FROM HrDocument d WHERE d.isDeleted = false AND d.employeeId = :employeeId ORDER BY d.uploadedAt DESC")
    List<HrDocument> findByEmployeeId(@Param("employeeId") UUID employeeId);

    @Query("SELECT d FROM HrDocument d WHERE d.isDeleted = false AND (:employeeId IS NULL OR d.employeeId = :employeeId) AND (:documentType IS NULL OR :documentType = '' OR d.documentType = :documentType)")
    Page<HrDocument> findAllFiltered(@Param("employeeId") UUID employeeId,
                                     @Param("documentType") String documentType,
                                     Pageable pageable);
}
