package com.everx.hr.leave;

import com.everx.hr.leave.dto.CreateLeaveRequest;
import com.everx.hr.leave.dto.LeaveRequestDto;
import com.everx.hr.leave.dto.UpdateLeaveRequest;
import com.everx.hr.LeaveStatus;
import com.everx.hr.LeaveType;
import com.everx.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/hr/leave-requests")
@RequiredArgsConstructor
public class LeaveController {

    private final LeaveService leaveService;

    @PostMapping
    @PreAuthorize("hasAuthority('HR_LEAVE_REQUEST_CREATE')")
    public ResponseEntity<ApiResponse<LeaveRequestDto>> createLeaveRequest(@Valid @RequestBody CreateLeaveRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(leaveService.createLeaveRequest(request), "Leave request created"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('HR_LEAVE_REQUEST_VIEW')")
    public ResponseEntity<ApiResponse<LeaveRequestDto>> getLeaveRequest(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(leaveService.getLeaveRequest(id)));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('HR_LEAVE_REQUEST_VIEW')")
    public ResponseEntity<ApiResponse<Page<LeaveRequestDto>>> getLeaveRequests(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) LeaveStatus status,
            @RequestParam(required = false) LeaveType leaveType,
            @RequestParam(required = false) UUID employeeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                leaveService.getLeaveRequests(pageable, search, status, leaveType, employeeId, startDate, endDate)));
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAuthority('HR_LEAVE_REQUEST_VIEW')")
    public ResponseEntity<ApiResponse<List<LeaveRequestDto>>> getLeaveRequestsByEmployee(@PathVariable UUID employeeId) {
        return ResponseEntity.ok(ApiResponse.ok(leaveService.getLeaveRequestsByEmployee(employeeId)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('HR_LEAVE_REQUEST_CREATE') or hasAuthority('HR_EDIT')")
    public ResponseEntity<ApiResponse<LeaveRequestDto>> updateLeaveRequest(
            @PathVariable UUID id,
            @RequestBody UpdateLeaveRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(leaveService.updateLeaveRequest(id, request), "Leave request updated"));
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAuthority('HR_LEAVE_REQUEST_APPROVE')")
    public ResponseEntity<ApiResponse<LeaveRequestDto>> approveLeaveRequest(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(leaveService.approveLeaveRequest(id), "Leave request approved"));
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAuthority('HR_LEAVE_REQUEST_CREATE') or hasAuthority('HR_EDIT')")
    public ResponseEntity<ApiResponse<LeaveRequestDto>> cancelLeaveRequest(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(leaveService.cancelLeaveRequest(id), "Leave request cancelled"));
    }
}
