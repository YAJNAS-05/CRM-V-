package com.everx.hr.leave;

import com.everx.hr.LeaveType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

public interface LeavePolicyRepository extends JpaRepository<LeavePolicy, UUID> {

    @Query("""
        SELECT p FROM LeavePolicy p
        WHERE p.isDeleted = false
          AND p.isActive = true
          AND p.leaveType = :leaveType
          AND (:date IS NULL OR (p.effectiveFrom IS NULL OR p.effectiveFrom <= :date))
          AND (:date IS NULL OR (p.effectiveTo IS NULL OR p.effectiveTo >= :date))
        """)
    Optional<LeavePolicy> findActivePolicy(@Param("leaveType") LeaveType leaveType, @Param("date") LocalDate date);

    Page<LeavePolicy> findAllByIsDeletedFalse(Pageable pageable);
}
