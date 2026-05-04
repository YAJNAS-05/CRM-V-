package com.everx.hr.leave;

import com.everx.hr.LeaveStatus;
import com.everx.hr.LeaveType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, UUID> {
    List<LeaveRequest> findByEmployeeId(UUID employeeId);

    List<LeaveRequest> findByEmployeeIdAndIsDeletedFalse(UUID employeeId);

    Optional<LeaveRequest> findByIdAndIsDeletedFalse(UUID id);

    Page<LeaveRequest> findAllByIsDeletedFalse(Pageable pageable);

        @Query("""
            SELECT l FROM LeaveRequest l
            WHERE l.isDeleted = false
              AND (:employeeId IS NULL OR l.employeeId = :employeeId)
              AND (:status IS NULL OR l.status = :status)
              AND (:leaveType IS NULL OR l.leaveType = :leaveType)
              AND (:startDate IS NULL OR l.startDate >= :startDate)
              AND (:endDate IS NULL OR l.endDate <= :endDate)
              AND (:search IS NULL OR :search = '' OR
               LOWER(COALESCE(l.notes, '')) LIKE LOWER(CONCAT('%', :search, '%')))
            """)
        Page<LeaveRequest> findAllFiltered(@Param("search") String search,
                           @Param("status") LeaveStatus status,
                           @Param("leaveType") LeaveType leaveType,
                           @Param("employeeId") UUID employeeId,
                           @Param("startDate") LocalDate startDate,
                           @Param("endDate") LocalDate endDate,
                           Pageable pageable);

    long countByEmployeeIdAndIsDeletedFalse(UUID employeeId);

    long countByEmployeeIdAndStatusAndIsDeletedFalse(UUID employeeId, LeaveStatus status);

    long countByEmployeeIdInAndStatusAndIsDeletedFalse(List<UUID> employeeIds, LeaveStatus status);

    long countByStatusAndIsDeletedFalse(LeaveStatus status);

    long countByStatusAndStartDateBetweenAndIsDeletedFalse(LeaveStatus status, LocalDate startDate, LocalDate endDate);
}
