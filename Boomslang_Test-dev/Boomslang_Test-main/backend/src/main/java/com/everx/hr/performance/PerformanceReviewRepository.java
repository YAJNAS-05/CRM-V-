package com.everx.hr.performance;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PerformanceReviewRepository extends JpaRepository<PerformanceReview, UUID> {

    Page<PerformanceReview> findByIsDeletedFalse(Pageable pageable);

    Page<PerformanceReview> findByEmployeeIdAndIsDeletedFalse(UUID employeeId, Pageable pageable);

    Page<PerformanceReview> findByReviewerIdAndIsDeletedFalse(UUID reviewerId, Pageable pageable);

    Optional<PerformanceReview> findByIdAndIsDeletedFalse(UUID id);
}
