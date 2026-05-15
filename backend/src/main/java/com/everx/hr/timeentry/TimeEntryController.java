package com.everx.hr.timeentry;

import com.everx.hr.timeentry.dto.StartTimerRequest;
import com.everx.hr.timeentry.dto.TimeEntryDto;
import com.everx.hr.timeentry.dto.WeeklyTimeEntriesDto;
import com.everx.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/hr/time-entries")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('HR_VIEW')")
public class TimeEntryController {

    private final TimeEntryService timeEntryService;

    @PostMapping("/start")
    public ResponseEntity<ApiResponse<TimeEntryDto>> startTimer(@Valid @RequestBody StartTimerRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(timeEntryService.startTimer(request), "Timer started"));
    }

    @PostMapping("/{timeEntryId}/stop")
    public ResponseEntity<ApiResponse<TimeEntryDto>> stopTimer(@PathVariable UUID timeEntryId) {
        return ResponseEntity.ok(ApiResponse.ok(timeEntryService.stopTimer(timeEntryId), "Timer stopped"));
    }

    @GetMapping("/employee/weekly")
    public ResponseEntity<ApiResponse<WeeklyTimeEntriesDto>> getWeeklyEntries(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart) {
        return ResponseEntity.ok(ApiResponse.ok(timeEntryService.getWeeklyEntries(weekStart)));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<ApiResponse<List<TimeEntryDto>>> getProjectTimeEntries(@PathVariable UUID projectId) {
        return ResponseEntity.ok(ApiResponse.ok(timeEntryService.getProjectTimeEntries(projectId)));
    }
}
