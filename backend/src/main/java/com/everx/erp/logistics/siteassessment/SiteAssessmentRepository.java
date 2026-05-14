package com.everx.erp.logistics.siteassessment;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SiteAssessmentRepository extends JpaRepository<SiteAssessment, UUID> {

    @Query("SELECT s FROM SiteAssessment s WHERE s.isDeleted = false AND s.id = :id")
    Optional<SiteAssessment> findByIdAndNotDeleted(@Param("id") UUID id);

    @Query("SELECT s FROM SiteAssessment s WHERE s.isDeleted = false")
    Page<SiteAssessment> findAllNotDeleted(Pageable pageable);

    @Query("SELECT s FROM SiteAssessment s WHERE s.isDeleted = false AND s.assessmentNumber = :assessmentNumber")
    Optional<SiteAssessment> findByAssessmentNumber(@Param("assessmentNumber") String assessmentNumber);

    @Query("SELECT s FROM SiteAssessment s WHERE s.isDeleted = false AND s.salesOrderId = :salesOrderId")
    Optional<SiteAssessment> findActiveBySalesOrderId(@Param("salesOrderId") UUID salesOrderId);

    @Query("SELECT s FROM SiteAssessment s WHERE s.isDeleted = false AND s.overallReadiness = :overallReadiness")
    Page<SiteAssessment> findByOverallReadiness(@Param("overallReadiness") String overallReadiness, Pageable pageable);
}
