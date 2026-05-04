package com.everx.hr.payroll;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

public interface PayrollRunRepository extends JpaRepository<PayrollRun, UUID> {

    @Query("SELECT r FROM PayrollRun r WHERE r.isDeleted = false")
    Page<PayrollRun> findAllNotDeleted(Pageable pageable);

        @Query("""
                        SELECT r FROM PayrollRun r
                        WHERE r.isDeleted = false
                            AND (:status IS NULL OR r.status = :status)
                            AND (:startDate IS NULL OR r.periodStart >= :startDate)
                            AND (:endDate IS NULL OR r.periodEnd <= :endDate)
                        """)
        Page<PayrollRun> findAllFiltered(@Param("status") com.everx.hr.PayrollRunStatus status,
                                                                         @Param("startDate") LocalDate startDate,
                                                                         @Param("endDate") LocalDate endDate,
                                                                         Pageable pageable);

    Optional<PayrollRun> findByIdAndIsDeletedFalse(UUID id);

    Optional<PayrollRun> findTopByIsDeletedFalseOrderByPeriodEndDesc();

    Optional<PayrollRun> findTopByIsDeletedFalseAndPeriodEndGreaterThanEqualOrderByPeriodEndAsc(LocalDate date);
}
