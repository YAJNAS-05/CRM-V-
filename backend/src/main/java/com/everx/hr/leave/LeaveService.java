package com.everx.hr.leave;

import com.everx.hr.LeaveStatus;
import com.everx.hr.LeaveType;
import com.everx.hr.employee.EmployeeRepository;
import com.everx.hr.leave.dto.CreateLeaveRequest;
import com.everx.hr.leave.dto.LeaveRequestDto;
import com.everx.hr.leave.dto.UpdateLeaveRequest;
import com.everx.shared.exception.EntityNotFoundException;
import com.everx.shared.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LeaveService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final EmployeeRepository employeeRepository;
    private final LeavePolicyService leavePolicyService;
    private final LeaveBalanceService leaveBalanceService;

    @Transactional
    public LeaveRequestDto createLeaveRequest(CreateLeaveRequest request) {
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new ValidationException("Leave end date cannot be before start date");
        }

        var employee = employeeRepository.findByIdAndNotDeleted(request.getEmployeeId())
                .orElseThrow(() -> new EntityNotFoundException("Employee not found with id: " + request.getEmployeeId()));

        LeavePolicy policy = leavePolicyService.getActivePolicy(request.getLeaveType(), request.getStartDate());
        BigDecimal requestedDays = calculateLeaveDays(request.getStartDate(), request.getEndDate());

        if (policy != null) {
            if (policy.getMinServiceDays() != null && employee.getHireDate() != null) {
                long serviceDays = ChronoUnit.DAYS.between(employee.getHireDate(), request.getStartDate());
                if (serviceDays < policy.getMinServiceDays()) {
                    throw new ValidationException("Employee does not meet minimum service requirement for this leave type");
                }
            }
        }

        LeaveRequest leave = new LeaveRequest();
        leave.setEmployeeId(request.getEmployeeId());
        leave.setLeaveType(request.getLeaveType());
        leave.setStartDate(request.getStartDate());
        leave.setEndDate(request.getEndDate());
        leave.setNotes(request.getNotes());

        if (policy != null && Boolean.FALSE.equals(policy.getRequiresApproval())) {
            leave.setStatus(LeaveStatus.APPROVED);
            leave.setApprovedAt(OffsetDateTime.now());
            leaveBalanceService.approve(request.getEmployeeId(), request.getLeaveType(), requestedDays, policy);
        } else {
            leave.setStatus(LeaveStatus.REQUESTED);
            leaveBalanceService.applyPending(request.getEmployeeId(), request.getLeaveType(), requestedDays, policy);
        }

        return toDto(leaveRequestRepository.save(leave));
    }

    @Transactional(readOnly = true)
    public LeaveRequestDto getLeaveRequest(UUID id) {
        LeaveRequest leave = leaveRequestRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Leave request not found with id: " + id));
        return toDto(leave);
    }

    @Transactional(readOnly = true)
    public Page<LeaveRequestDto> getLeaveRequests(Pageable pageable,
                                                  String search,
                                                  LeaveStatus status,
                                                  LeaveType leaveType,
                                                  UUID employeeId,
                                                  LocalDate startDate,
                                                  LocalDate endDate) {
        return leaveRequestRepository.findAllFiltered(search, status, leaveType, employeeId, startDate, endDate, pageable)
                .map(this::toDto);
    }

    @Transactional(readOnly = true)
    public List<LeaveRequestDto> getLeaveRequestsByEmployee(UUID employeeId) {
        return leaveRequestRepository.findByEmployeeIdAndIsDeletedFalse(employeeId).stream().map(this::toDto).toList();
    }

    @Transactional
    public LeaveRequestDto updateLeaveRequest(UUID id, UpdateLeaveRequest request) {
        LeaveRequest leave = leaveRequestRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Leave request not found with id: " + id));

        LeaveStatus previousStatus = leave.getStatus();
        LeaveType oldType = leave.getLeaveType();
        LocalDate oldStart = leave.getStartDate();
        LocalDate oldEnd = leave.getEndDate();
        BigDecimal oldDays = calculateLeaveDays(oldStart, oldEnd);

        LeaveType newType = request.getLeaveType() != null ? request.getLeaveType() : oldType;
        LocalDate newStart = request.getStartDate() != null ? request.getStartDate() : oldStart;
        LocalDate newEnd = request.getEndDate() != null ? request.getEndDate() : oldEnd;

        if (newEnd.isBefore(newStart)) {
            throw new ValidationException("Leave end date cannot be before start date");
        }

        BigDecimal newDays = calculateLeaveDays(newStart, newEnd);

        if (leave.getStatus() == LeaveStatus.REQUESTED && (!oldType.equals(newType) || oldDays.compareTo(newDays) != 0)) {
            leaveBalanceService.rollbackPending(leave.getEmployeeId(), oldType, oldDays);
            LeavePolicy policy = leavePolicyService.getActivePolicy(newType, newStart);
            leaveBalanceService.applyPending(leave.getEmployeeId(), newType, newDays, policy);
        }

        if (request.getLeaveType() != null) leave.setLeaveType(request.getLeaveType());
        if (request.getStartDate() != null) leave.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) leave.setEndDate(request.getEndDate());
        if (request.getStatus() != null) leave.setStatus(request.getStatus());
        if (request.getNotes() != null) leave.setNotes(request.getNotes());

        if (request.getStatus() != null && previousStatus == LeaveStatus.REQUESTED && leave.getStatus() == LeaveStatus.APPROVED) {
            LeavePolicy policy = leavePolicyService.getActivePolicy(leave.getLeaveType(), leave.getStartDate());
            leaveBalanceService.approve(leave.getEmployeeId(), leave.getLeaveType(), newDays, policy);
        } else if (request.getStatus() != null && previousStatus == LeaveStatus.REQUESTED
                && (leave.getStatus() == LeaveStatus.REJECTED || leave.getStatus() == LeaveStatus.CANCELLED)) {
            leaveBalanceService.rollbackPending(leave.getEmployeeId(), leave.getLeaveType(), newDays);
        }

        return toDto(leaveRequestRepository.save(leave));
    }

    @Transactional
    public LeaveRequestDto approveLeaveRequest(UUID id, UUID approvedBy) {
        LeaveRequest leave = leaveRequestRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Leave request not found with id: " + id));
        leave.setStatus(LeaveStatus.APPROVED);
        leave.setApprovedBy(approvedBy);
        leave.setApprovedAt(OffsetDateTime.now());

        LeavePolicy policy = leavePolicyService.getActivePolicy(leave.getLeaveType(), leave.getStartDate());
        BigDecimal days = calculateLeaveDays(leave.getStartDate(), leave.getEndDate());
        leaveBalanceService.approve(leave.getEmployeeId(), leave.getLeaveType(), days, policy);

        return toDto(leaveRequestRepository.save(leave));
    }

    @Transactional
    public LeaveRequestDto cancelLeaveRequest(UUID id) {
        LeaveRequest leave = leaveRequestRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Leave request not found with id: " + id));

        if (leave.getStatus() == LeaveStatus.APPROVED) {
            throw new ValidationException("Approved leave requests cannot be cancelled");
        }

        leave.setStatus(LeaveStatus.CANCELLED);
        BigDecimal days = calculateLeaveDays(leave.getStartDate(), leave.getEndDate());
        leaveBalanceService.rollbackPending(leave.getEmployeeId(), leave.getLeaveType(), days);

        return toDto(leaveRequestRepository.save(leave));
    }

    private BigDecimal calculateLeaveDays(LocalDate startDate, LocalDate endDate) {
        long days = ChronoUnit.DAYS.between(startDate, endDate) + 1;
        return BigDecimal.valueOf(Math.max(days, 0));
    }

    private LeaveRequestDto toDto(LeaveRequest leave) {
        LeaveRequestDto dto = new LeaveRequestDto();
        dto.setId(leave.getId());
        dto.setEmployeeId(leave.getEmployeeId());
        dto.setLeaveType(leave.getLeaveType());
        dto.setStartDate(leave.getStartDate());
        dto.setEndDate(leave.getEndDate());
        dto.setStatus(leave.getStatus());
        dto.setApprovedBy(leave.getApprovedBy());
        dto.setApprovedAt(leave.getApprovedAt());
        dto.setNotes(leave.getNotes());
        if (leave.getCreatedAt() != null) {
            dto.setCreatedAt(leave.getCreatedAt().toInstant());
        }
        if (leave.getUpdatedAt() != null) {
            dto.setUpdatedAt(leave.getUpdatedAt().toInstant());
        }
        return dto;
    }
}
