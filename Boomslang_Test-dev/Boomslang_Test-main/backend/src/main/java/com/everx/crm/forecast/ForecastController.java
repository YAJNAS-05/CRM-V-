package com.everx.crm.forecast;

import com.everx.crm.forecast.dto.PipelineForecastDto;
import com.everx.crm.forecast.dto.SalesVelocityDto;
import com.everx.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/crm/forecast")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('CRM_VIEW', 'CRM_REPORT_VIEW', 'SALES_MANAGER', 'MANAGER', 'ADMIN', 'SUPER_ADMIN')")
public class ForecastController {

    private final PipelineForecastingService forecastingService;

    @GetMapping("/pipeline")
    public ResponseEntity<ApiResponse<PipelineForecastDto>> getPipelineForecast(
            @RequestParam(required = false) UUID ownerId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        PipelineForecastDto forecast = forecastingService.getPipelineForecast(ownerId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.ok(forecast));
    }

    @GetMapping("/velocity")
    public ResponseEntity<ApiResponse<SalesVelocityDto>> getSalesVelocity(
            @RequestParam(required = false) UUID ownerId,
            @RequestParam(defaultValue = "6") int monthsBack) {
        SalesVelocityDto velocity = forecastingService.getSalesVelocity(ownerId, monthsBack);
        return ResponseEntity.ok(ApiResponse.ok(velocity));
    }

    @GetMapping("/my-pipeline")
    public ResponseEntity<ApiResponse<PipelineForecastDto>> getMyPipelineForecast(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        // Get current user ID from security context
        UUID currentUserId = com.everx.shared.util.SecurityUserContext.getCurrentUserIdOrNull();
        PipelineForecastDto forecast = forecastingService.getPipelineForecast(currentUserId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.ok(forecast));
    }

    @GetMapping("/my-velocity")
    public ResponseEntity<ApiResponse<SalesVelocityDto>> getMySalesVelocity(
            @RequestParam(defaultValue = "6") int monthsBack) {
        UUID currentUserId = com.everx.shared.util.SecurityUserContext.getCurrentUserIdOrNull();
        SalesVelocityDto velocity = forecastingService.getSalesVelocity(currentUserId, monthsBack);
        return ResponseEntity.ok(ApiResponse.ok(velocity));
    }
}
