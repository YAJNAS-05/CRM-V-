package com.everx.hr.leave;

import com.everx.hr.LeaveStatus;
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

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LeaveService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final EmployeeRepository employeeRepository;

    @Transactional
    public LeaveRequestDto createLeaveRequest(CreateLeaveRequest request) {
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new ValidationException("Leave end date cannot be before start date");
        }

        employeeRepository.findByIdAndNotDeleted(request.getEmployeeId())
                .orElseThrow(() -> new EntityNotFoundException("Employee not found with id: " + request.getEmployeeId()));

        LeaveRequest leave = new LeaveRequest();
        leave.setEmployeeId(request.getEmployeeId());
        leave.setLeaveType(request.getLeaveType());
        leave.setStartDate(request.getStartDate());
        leave.setEndDate(request.getEndDate());
        leave.setNotes(request.getNotes());
        leave.setStatus(LeaveStatus.REQUESTED);

        return toDto(leaveRequestRepository.save(leave));
    }

    @Transactional(readOnly = true)
    public LeaveRequestDto getLeaveRequest(UUID id) {
        LeaveRequest leave = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Leave request not found with id: " + id));
        return toDto(leave);
    }

    @Transactional(readOnly = true)
    public Page<LeaveRequestDto> getLeaveRequests(Pageable pageable) {
        return leaveRequestRepository.findAll(pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public List<LeaveRequestDto> getLeaveRequestsByEmployee(UUID employeeId) {
        return leaveRequestRepository.findByEmployeeId(employeeId).stream().map(this::toDto).toList();
    }

    @Transactional
    public LeaveRequestDto updateLeaveRequest(UUID id, UpdateLeaveRequest request) {
        LeaveRequest leave = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Leave request not found with id: " + id));

        if (request.getLeaveType() != null) leave.setLeaveType(request.getLeaveType());
        if (request.getStartDate() != null) leave.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) leave.setEndDate(request.getEndDate());
        if (request.getStatus() != null) leave.setStatus(request.getStatus());
        if (request.getNotes() != null) leave.setNotes(request.getNotes());

        return toDto(leaveRequestRepository.save(leave));
    }

    @Transactional
    public LeaveRequestDto approveLeaveRequest(UUID id, UUID approvedBy) {
        LeaveRequest leave = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Leave request not found with id: " + id));
        leave.setStatus(LeaveStatus.APPROVED);
        leave.setApprovedBy(approvedBy);
        leave.setApprovedAt(OffsetDateTime.now());
        return toDto(leaveRequestRepository.save(leave));
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
