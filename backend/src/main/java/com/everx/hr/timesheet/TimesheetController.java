package com.everx.hr.timesheet;

import com.everx.hr.timesheet.dto.CreateTimesheetRequest;
import com.everx.hr.timesheet.dto.TimesheetDto;
import com.everx.hr.timesheet.dto.UpdateTimesheetRequest;
import com.everx.hr.TimesheetStatus;
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
@RequestMapping("/api/v1/hr/timesheets")
@RequiredArgsConstructor
public class TimesheetController {

    private final TimesheetService timesheetService;

    @PostMapping
    @PreAuthorize("hasAuthority('HR_TIMESHEET_CREATE')")
    public ResponseEntity<ApiResponse<TimesheetDto>> createTimesheet(@Valid @RequestBody CreateTimesheetRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(timesheetService.createTimesheet(request), "Timesheet created"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('HR_TIMESHEET_VIEW')")
    public ResponseEntity<ApiResponse<TimesheetDto>> getTimesheet(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(timesheetService.getTimesheetById(id)));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('HR_TIMESHEET_VIEW')")
    public ResponseEntity<ApiResponse<Page<TimesheetDto>>> getTimesheets(
            @RequestParam(required = false) UUID employeeId,
            @RequestParam(required = false) TimesheetStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                timesheetService.getTimesheets(pageable, employeeId, status, startDate, endDate)));
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAuthority('HR_TIMESHEET_VIEW')")
    public ResponseEntity<ApiResponse<List<TimesheetDto>>> getTimesheetsByEmployee(@PathVariable UUID employeeId) {
        return ResponseEntity.ok(ApiResponse.ok(timesheetService.getTimesheetsByEmployee(employeeId)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('HR_TIMESHEET_CREATE') or hasAuthority('HR_EDIT')")
    public ResponseEntity<ApiResponse<TimesheetDto>> updateTimesheet(
            @PathVariable UUID id,
            @RequestBody UpdateTimesheetRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(timesheetService.updateTimesheet(id, request), "Timesheet updated"));
    }

    @PatchMapping("/{id}/submit")
    @PreAuthorize("hasAuthority('HR_TIMESHEET_CREATE')")
    public ResponseEntity<ApiResponse<TimesheetDto>> submitTimesheet(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(timesheetService.submitTimesheet(id), "Timesheet submitted"));
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAuthority('HR_TIMESHEET_APPROVE')")
    public ResponseEntity<ApiResponse<TimesheetDto>> approveTimesheet(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(timesheetService.approveTimesheet(id), "Timesheet approved"));
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasAuthority('HR_TIMESHEET_APPROVE')")
    public ResponseEntity<ApiResponse<TimesheetDto>> rejectTimesheet(
            @PathVariable UUID id,
            @RequestParam(required = false) String notes) {
        return ResponseEntity.ok(ApiResponse.ok(timesheetService.rejectTimesheet(id, notes), "Timesheet rejected"));
    }
}
