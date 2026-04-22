package com.everx.hr.leave;

import com.everx.hr.LeaveStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, UUID> {
    List<LeaveRequest> findByEmployeeId(UUID employeeId);

    long countByEmployeeIdAndIsDeletedFalse(UUID employeeId);

    long countByEmployeeIdAndStatusAndIsDeletedFalse(UUID employeeId, LeaveStatus status);

    long countByEmployeeIdInAndStatusAndIsDeletedFalse(List<UUID> employeeIds, LeaveStatus status);
}
