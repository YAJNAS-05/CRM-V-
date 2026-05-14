package com.everx.hr.payslip;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PayslipRepository extends JpaRepository<Payslip, UUID> {

    @Query("SELECT p FROM Payslip p WHERE p.isDeleted = false AND p.id = :id")
    Optional<Payslip> findByIdAndNotDeleted(@Param("id") UUID id);

    @Query("SELECT p FROM Payslip p WHERE p.isDeleted = false AND p.employeeId = :employeeId ORDER BY p.payPeriodEnd DESC")
    List<Payslip> findByEmployeeId(@Param("employeeId") UUID employeeId);

    @Query("SELECT p FROM Payslip p WHERE p.isDeleted = false ORDER BY p.payPeriodEnd DESC")
    Page<Payslip> findAllNotDeleted(Pageable pageable);

    @Query("SELECT p FROM Payslip p WHERE p.isDeleted = false AND (:employeeId IS NULL OR p.employeeId = :employeeId) AND (:payrollRunId IS NULL OR p.payrollRunId = :payrollRunId)")
    Page<Payslip> findAllFiltered(@Param("employeeId") UUID employeeId,
                                  @Param("payrollRunId") UUID payrollRunId,
                                  Pageable pageable);
}
