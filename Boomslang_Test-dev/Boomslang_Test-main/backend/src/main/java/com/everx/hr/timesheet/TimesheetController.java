package com.everx.hr.timesheet;

import com.everx.hr.timesheet.dto.CreateTimesheetRequest;
import com.everx.hr.timesheet.dto.TimesheetDto;
import com.everx.hr.timesheet.dto.UpdateTimesheetRequest;
import com.everx.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/hr/timesheets")
@RequiredArgsConstructor
public class TimesheetController {

    private final TimesheetService timesheetService;

    @PostMapping
    public ResponseEntity<ApiResponse<TimesheetDto>> createTimesheet(@Valid @RequestBody CreateTimesheetRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(timesheetService.createTimesheet(request), "Timesheet created"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TimesheetDto>> getTimesheet(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(timesheetService.getTimesheetById(id)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<TimesheetDto>>> getTimesheets(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(timesheetService.getTimesheets(pageable)));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<ApiResponse<List<TimesheetDto>>> getTimesheetsByEmployee(@PathVariable UUID employeeId) {
        return ResponseEntity.ok(ApiResponse.ok(timesheetService.getTimesheetsByEmployee(employeeId)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TimesheetDto>> updateTimesheet(
            @PathVariable UUID id,
            @RequestBody UpdateTimesheetRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(timesheetService.updateTimesheet(id, request), "Timesheet updated"));
    }

    @PatchMapping("/{id}/submit")
    public ResponseEntity<ApiResponse<TimesheetDto>> submitTimesheet(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(timesheetService.submitTimesheet(id), "Timesheet submitted"));
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<TimesheetDto>> approveTimesheet(
            @PathVariable UUID id,
            @RequestParam UUID approvedBy) {
        return ResponseEntity.ok(ApiResponse.ok(timesheetService.approveTimesheet(id, approvedBy), "Timesheet approved"));
    }
}
