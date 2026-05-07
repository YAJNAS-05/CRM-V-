package com.everx.hr.attendance;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AttendancePunchRepository extends JpaRepository<AttendancePunch, UUID> {

    Optional<AttendancePunch> findTopByEmployeeIdAndIsDeletedFalseAndPunchOutIsNullOrderByPunchInDesc(UUID employeeId);

    @Query("""
            SELECT a FROM AttendancePunch a
            WHERE a.isDeleted = false
              AND a.employeeId = :employeeId
              AND a.workDate BETWEEN :startDate AND :endDate
            ORDER BY a.workDate DESC, a.punchIn DESC
            """)
    List<AttendancePunch> findForEmployeeBetween(@Param("employeeId") UUID employeeId,
                                                 @Param("startDate") LocalDate startDate,
                                                 @Param("endDate") LocalDate endDate);

    @Query("""
            SELECT a FROM AttendancePunch a
            WHERE a.isDeleted = false
              AND (:employeeId IS NULL OR a.employeeId = :employeeId)
              AND a.workDate BETWEEN :startDate AND :endDate
            ORDER BY a.workDate DESC, a.punchIn DESC
            """)
    List<AttendancePunch> findBetween(@Param("employeeId") UUID employeeId,
                                      @Param("startDate") LocalDate startDate,
                                      @Param("endDate") LocalDate endDate);
}

