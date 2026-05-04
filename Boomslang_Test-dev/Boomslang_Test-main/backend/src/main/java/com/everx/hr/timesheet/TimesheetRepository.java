package com.everx.hr.timesheet;

import com.everx.hr.TimesheetStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TimesheetRepository extends JpaRepository<Timesheet, UUID> {

    List<Timesheet> findByEmployeeId(UUID employeeId);

    List<Timesheet> findByEmployeeIdAndIsDeletedFalse(UUID employeeId);

    Optional<Timesheet> findByIdAndIsDeletedFalse(UUID id);

    Optional<Timesheet> findByEmployeeIdAndWorkDateAndIsDeletedFalse(UUID employeeId, LocalDate workDate);

    Page<Timesheet> findAllByIsDeletedFalse(Pageable pageable);

        @Query("""
                        SELECT t FROM Timesheet t
                        WHERE t.isDeleted = false
                            AND (:employeeId IS NULL OR t.employeeId = :employeeId)
                            AND (:status IS NULL OR t.status = :status)
                            AND (:startDate IS NULL OR t.workDate >= :startDate)
                            AND (:endDate IS NULL OR t.workDate <= :endDate)
                        """)
        Page<Timesheet> findAllFiltered(@Param("employeeId") UUID employeeId,
                                                                        @Param("status") TimesheetStatus status,
                                                                        @Param("startDate") LocalDate startDate,
                                                                        @Param("endDate") LocalDate endDate,
                                                                        Pageable pageable);

    long countByEmployeeIdAndIsDeletedFalse(UUID employeeId);

    long countByEmployeeIdAndStatusAndIsDeletedFalse(UUID employeeId, TimesheetStatus status);

    long countByEmployeeIdInAndStatusAndIsDeletedFalse(List<UUID> employeeIds, TimesheetStatus status);

    long countByStatusAndIsDeletedFalse(TimesheetStatus status);

    @Query("SELECT COALESCE(SUM(t.hoursWorked), 0) FROM Timesheet t " +
            "WHERE t.employeeId = :employeeId AND t.status = :status " +
            "AND t.workDate >= :startDate AND t.workDate <= :endDate")
    BigDecimal sumHoursForEmployee(@Param("employeeId") UUID employeeId,
                                   @Param("status") TimesheetStatus status,
                                   @Param("startDate") LocalDate startDate,
                                   @Param("endDate") LocalDate endDate);
}
