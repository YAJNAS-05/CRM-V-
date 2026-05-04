package com.everx.hr.leave;

import com.everx.hr.LeaveType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance, UUID> {
    Optional<LeaveBalance> findByEmployeeIdAndLeaveTypeAndIsDeletedFalse(UUID employeeId, LeaveType leaveType);

    List<LeaveBalance> findByEmployeeIdAndIsDeletedFalse(UUID employeeId);
}
