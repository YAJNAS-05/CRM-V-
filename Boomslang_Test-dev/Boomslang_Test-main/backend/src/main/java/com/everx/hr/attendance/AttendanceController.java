package com.everx.hr.attendance;

import com.everx.hr.attendance.dto.AttendanceCorrectionRequest;
import com.everx.hr.attendance.dto.AttendancePunchDto;
import com.everx.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/hr/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/check-in")
    public ResponseEntity<ApiResponse<AttendancePunchDto>> checkIn(@RequestParam(required = false) String notes) {
        return ResponseEntity.ok(ApiResponse.ok(attendanceService.checkIn(notes), "Checked in"));
    }

    @PostMapping("/check-out")
    public ResponseEntity<ApiResponse<AttendancePunchDto>> checkOut(@RequestParam(required = false) String notes) {
        return ResponseEntity.ok(ApiResponse.ok(attendanceService.checkOut(notes), "Checked out"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<AttendancePunchDto>>> myAttendance(
            @RequestParam(required = false) LocalDate start,
            @RequestParam(required = false) LocalDate end
    ) {
        return ResponseEntity.ok(ApiResponse.ok(attendanceService.getMyAttendance(start, end)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AttendancePunchDto>>> attendance(
            @RequestParam(required = false) LocalDate start,
            @RequestParam(required = false) LocalDate end,
            @RequestParam(required = false) UUID employeeId
    ) {
        return ResponseEntity.ok(ApiResponse.ok(attendanceService.getAttendance(start, end, employeeId)));
    }

    @PostMapping("/{punchId}/correction")
    public ResponseEntity<ApiResponse<AttendancePunchDto>> correction(
            @PathVariable UUID punchId,
            @Valid @RequestBody AttendanceCorrectionRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(attendanceService.correctPunch(punchId, request), "Correction saved"));
    }
}

