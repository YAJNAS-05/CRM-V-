package com.everx.hr.timeentry;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TimeEntryRepository extends JpaRepository<TimeEntry, UUID> {

    Optional<TimeEntry> findByIdAndIsDeletedFalse(UUID id);

    List<TimeEntry> findByProjectIdAndIsDeletedFalse(UUID projectId);

    List<TimeEntry> findByTimesheetIdAndIsDeletedFalse(UUID timesheetId);

    @Query("""
            SELECT t FROM TimeEntry t
            WHERE t.isDeleted = false
              AND t.employeeId = :employeeId
              AND t.endTime IS NULL
            """)
    Optional<TimeEntry> findActiveTimerByEmployeeId(@Param("employeeId") UUID employeeId);

    @Query("""
            SELECT t FROM TimeEntry t
            WHERE t.isDeleted = false
              AND t.employeeId = :employeeId
              AND t.workDate BETWEEN :startDate AND :endDate
            """)
    List<TimeEntry> findByEmployeeAndWorkDateRange(@Param("employeeId") UUID employeeId,
                                                   @Param("startDate") LocalDate startDate,
                                                   @Param("endDate") LocalDate endDate);
}
