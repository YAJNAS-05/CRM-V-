package com.everx.hr.reimbursement;

import com.everx.hr.ReimbursementStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

public interface ReimbursementRepository extends JpaRepository<ReimbursementRequest, UUID> {

    Optional<ReimbursementRequest> findByIdAndIsDeletedFalse(UUID id);

    Page<ReimbursementRequest> findAllByIsDeletedFalse(Pageable pageable);

    @Query("""
            SELECT r FROM ReimbursementRequest r
            WHERE r.isDeleted = false
              AND (:requestedBy IS NULL OR r.requestedBy = :requestedBy)
              AND (:status IS NULL OR r.status = :status)
              AND (:startDate IS NULL OR r.requestDate >= :startDate)
              AND (:endDate IS NULL OR r.requestDate <= :endDate)
              AND (:search IS NULL OR :search = '' OR
                LOWER(COALESCE(r.category, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(COALESCE(r.description, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(COALESCE(r.requesterEmail, '')) LIKE LOWER(CONCAT('%', :search, '%')))
            """)
    Page<ReimbursementRequest> findAllFiltered(@Param("search") String search,
                                               @Param("status") ReimbursementStatus status,
                                               @Param("requestedBy") UUID requestedBy,
                                               @Param("startDate") LocalDate startDate,
                                               @Param("endDate") LocalDate endDate,
                                               Pageable pageable);

    long countByStatusAndIsDeletedFalse(ReimbursementStatus status);

    long countByRequestedByAndIsDeletedFalse(UUID requestedBy);
}
