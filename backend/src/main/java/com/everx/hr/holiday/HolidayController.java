package com.everx.hr.holiday;

import com.everx.hr.holiday.dto.CreateHolidayRequest;
import com.everx.hr.holiday.dto.HolidayDto;
import com.everx.hr.holiday.dto.UpdateHolidayRequest;
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
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/hr/holidays")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('HR_VIEW')")
public class HolidayController {

    private final HolidayService holidayService;

    @PostMapping
    public ResponseEntity<ApiResponse<HolidayDto>> createHoliday(@Valid @RequestBody CreateHolidayRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(holidayService.createHoliday(request), "Holiday created"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<HolidayDto>> getHoliday(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(holidayService.getHoliday(id)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<HolidayDto>>> getHolidays(
            @RequestParam(required = false) String region,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(holidayService.getHolidays(pageable, region, startDate, endDate)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<HolidayDto>> updateHoliday(
            @PathVariable UUID id,
            @RequestBody UpdateHolidayRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(holidayService.updateHoliday(id, request), "Holiday updated"));
    }
}
