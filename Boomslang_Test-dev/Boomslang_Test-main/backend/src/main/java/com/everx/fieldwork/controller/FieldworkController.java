package com.everx.fieldwork.controller;

import com.everx.fieldwork.dto.*;
import com.everx.fieldwork.service.FieldJobService;
import com.everx.fieldwork.service.TechnicianService;
import com.everx.fieldwork.service.GpsTrackingService;
import com.everx.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/fieldwork")
@RequiredArgsConstructor
@Slf4j
public class FieldworkController {

    private final FieldJobService fieldJobService;
    private final TechnicianService technicianService;
    private final GpsTrackingService gpsTrackingService;

    // Field Job Management
    @GetMapping("/jobs")
    @PreAuthorize("hasAuthority('FIELDWORK_VIEW')")
    public ResponseEntity<ApiResponse<Page<FieldJobDto>>> getAllJobs(
            @PageableDefault(size = 20, page = 0, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/v1/fieldwork/jobs");
        Page<FieldJobDto> jobs = fieldJobService.getAllJobs(pageable);
        return ResponseEntity.ok(ApiResponse.ok(jobs, "Field jobs retrieved successfully"));
    }

    @GetMapping("/jobs/{jobId}")
    @PreAuthorize("hasAuthority('FIELDWORK_VIEW')")
    public ResponseEntity<ApiResponse<FieldJobDto>> getJobById(@PathVariable UUID jobId) {
        log.info("GET /api/v1/fieldwork/jobs/{}", jobId);
        FieldJobDto job = fieldJobService.getJobById(jobId);
        return ResponseEntity.ok(ApiResponse.ok(job, "Field job retrieved successfully"));
    }

    @PostMapping("/jobs")
    @PreAuthorize("hasAuthority('FIELDWORK_CREATE')")
    public ResponseEntity<ApiResponse<FieldJobDto>> createJob(@Valid @RequestBody CreateFieldJobRequest request) {
        log.info("POST /api/v1/fieldwork/jobs - Creating field job");
        ApiResponse<FieldJobDto> response = fieldJobService.createJob(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/jobs/{jobId}")
    @PreAuthorize("hasAuthority('FIELDWORK_UPDATE')")
    public ResponseEntity<ApiResponse<FieldJobDto>> updateJob(@PathVariable UUID jobId, @Valid @RequestBody UpdateFieldJobRequest request) {
        log.info("PUT /api/v1/fieldwork/jobs/{} - Updating field job", jobId);
        ApiResponse<FieldJobDto> response = fieldJobService.updateJob(jobId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/jobs/{jobId}")
    @PreAuthorize("hasAuthority('FIELDWORK_DELETE')")
    public ResponseEntity<ApiResponse<Void>> deleteJob(@PathVariable UUID jobId) {
        log.info("DELETE /api/v1/fieldwork/jobs/{} - Deleting field job", jobId);
        fieldJobService.deleteJob(jobId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Field job deleted successfully"));
    }

    // Field Job Sign Off
    @PostMapping("/jobs/{jobId}/signoff")
    @PreAuthorize("hasAuthority('FIELDWORK_UPDATE')")
    public ResponseEntity<ApiResponse<FieldJobSignOffDto>> signOffJob(@PathVariable UUID jobId, @Valid @RequestBody FieldJobSignOffRequest request) {
        log.info("POST /api/v1/fieldwork/jobs/{}/signoff - Signing off field job", jobId);
        ApiResponse<FieldJobSignOffDto> response = fieldJobService.signOffJob(jobId, request);
        return ResponseEntity.ok(response);
    }

    // Field Job Costs
    @GetMapping("/jobs/{jobId}/costs")
    @PreAuthorize("hasAuthority('FIELDWORK_VIEW')")
    public ResponseEntity<ApiResponse<FieldJobCostDto>> getJobCosts(@PathVariable UUID jobId) {
        log.info("GET /api/v1/fieldwork/jobs/{}/costs", jobId);
        FieldJobCostDto costs = fieldJobService.getJobCosts(jobId);
        return ResponseEntity.ok(ApiResponse.ok(costs, "Field job costs retrieved successfully"));
    }

    // Field Job Travel
    @GetMapping("/jobs/{jobId}/travel")
    @PreAuthorize("hasAuthority('FIELDWORK_VIEW')")
    public ResponseEntity<ApiResponse<FieldJobTravelDto>> getJobTravel(@PathVariable UUID jobId) {
        log.info("GET /api/v1/fieldwork/jobs/{}/travel", jobId);
        FieldJobTravelDto travel = fieldJobService.getJobTravel(jobId);
        return ResponseEntity.ok(ApiResponse.ok(travel, "Field job travel retrieved successfully"));
    }

    // Field Job Checklists
    @GetMapping("/jobs/{jobId}/checklists")
    @PreAuthorize("hasAuthority('FIELDWORK_VIEW')")
    public ResponseEntity<ApiResponse<FieldJobChecklistDto>> getJobChecklists(@PathVariable UUID jobId) {
        log.info("GET /api/v1/fieldwork/jobs/{}/checklists", jobId);
        FieldJobChecklistDto checklists = fieldJobService.getJobChecklists(jobId);
        return ResponseEntity.ok(ApiResponse.ok(checklists, "Field job checklists retrieved successfully"));
    }

    // Field Job Reports
    @GetMapping("/jobs/{jobId}/reports")
    @PreAuthorize("hasAuthority('FIELDWORK_VIEW')")
    public ResponseEntity<ApiResponse<FieldJobReportDto>> getJobReports(@PathVariable UUID jobId) {
        log.info("GET /api/v1/fieldwork/jobs/{}/reports", jobId);
        FieldJobReportDto reports = fieldJobService.getJobReports(jobId);
        return ResponseEntity.ok(ApiResponse.ok(reports, "Field job reports retrieved successfully"));
    }

    // Technician Management
    @GetMapping("/technicians")
    @PreAuthorize("hasAuthority('FIELDWORK_VIEW')")
    public ResponseEntity<ApiResponse<Page<TechnicianDto>>> getAllTechnicians(
            @PageableDefault(size = 20, page = 0, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/v1/fieldwork/technicians");
        Page<TechnicianDto> technicians = technicianService.getAllTechnicians(pageable);
        return ResponseEntity.ok(ApiResponse.ok(technicians, "Technicians retrieved successfully"));
    }

    @GetMapping("/technicians/{technicianId}")
    @PreAuthorize("hasAuthority('FIELDWORK_VIEW')")
    public ResponseEntity<ApiResponse<TechnicianDto>> getTechnicianById(@PathVariable UUID technicianId) {
        log.info("GET /api/v1/fieldwork/technicians/{}", technicianId);
        TechnicianDto technician = technicianService.getTechnicianById(technicianId);
        return ResponseEntity.ok(ApiResponse.ok(technician, "Technician retrieved successfully"));
    }

    @PostMapping("/technicians")
    @PreAuthorize("hasAuthority('FIELDWORK_CREATE')")
    public ResponseEntity<ApiResponse<TechnicianDto>> createTechnician(@Valid @RequestBody CreateTechnicianRequest request) {
        log.info("POST /api/v1/fieldwork/technicians - Creating technician");
        ApiResponse<TechnicianDto> response = technicianService.createTechnician(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/technicians/{technicianId}")
    @PreAuthorize("hasAuthority('FIELDWORK_UPDATE')")
    public ResponseEntity<ApiResponse<TechnicianDto>> updateTechnician(@PathVariable UUID technicianId, @Valid @RequestBody UpdateTechnicianRequest request) {
        log.info("PUT /api/v1/fieldwork/technicians/{} - Updating technician", technicianId);
        ApiResponse<TechnicianDto> response = technicianService.updateTechnician(technicianId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/technicians/{technicianId}/performance")
    @PreAuthorize("hasAuthority('FIELDWORK_VIEW')")
    public ResponseEntity<ApiResponse<TechnicianPerformanceDto>> getTechnicianPerformance(@PathVariable UUID technicianId) {
        log.info("GET /api/v1/fieldwork/technicians/{}/performance", technicianId);
        ApiResponse<TechnicianPerformanceDto> response = technicianService.getTechnicianPerformance(technicianId);
        return ResponseEntity.ok(response);
    }

    // GPS Tracking
    @GetMapping("/gps/locations")
    @PreAuthorize("hasAuthority('FIELDWORK_VIEW')")
    public ResponseEntity<ApiResponse<Page<GpsLocationDto>>> getGpsLocations(
            @RequestParam(required = false) UUID technicianId,
            @PageableDefault(size = 50, page = 0, sort = "timestamp", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/v1/fieldwork/gps/locations - technicianId: {}", technicianId);
        Page<GpsLocationDto> locations = gpsTrackingService.getTechnicianLocations(technicianId, pageable);
        return ResponseEntity.ok(ApiResponse.ok(locations, "GPS locations retrieved successfully"));
    }

    @PostMapping("/gps/locations")
    @PreAuthorize("hasAuthority('FIELDWORK_UPDATE')")
    public ResponseEntity<ApiResponse<GpsLocationDto>> createGpsLocation(@Valid @RequestBody CreateGpsLocationRequest request) {
        log.info("POST /api/v1/fieldwork/gps/locations - Creating GPS location");
        ApiResponse<GpsLocationDto> response = gpsTrackingService.createGpsLocation(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/gps/technicians/{technicianId}/stats")
    @PreAuthorize("hasAuthority('FIELDWORK_VIEW')")
    public ResponseEntity<ApiResponse<GpsLocationStatsDto>> getTechnicianGpsStats(
            @PathVariable UUID technicianId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        log.info("GET /api/v1/fieldwork/gps/technicians/{}/stats", technicianId);
        ApiResponse<GpsLocationStatsDto> response = gpsTrackingService.getTechnicianStats(technicianId, startDate, endDate);
        return ResponseEntity.ok(response);
    }

    // Field Work Assets
    @GetMapping("/assets")
    @PreAuthorize("hasAuthority('FIELDWORK_VIEW')")
    public ResponseEntity<ApiResponse<Page<FieldWorkAssetDto>>> getAllAssets(
            @PageableDefault(size = 20, page = 0, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/v1/fieldwork/assets");
        Page<FieldWorkAssetDto> assets = fieldJobService.getAllAssets(pageable);
        return ResponseEntity.ok(ApiResponse.ok(assets, "Field work assets retrieved successfully"));
    }

    @GetMapping("/assets/{assetId}")
    @PreAuthorize("hasAuthority('FIELDWORK_VIEW')")
    public ResponseEntity<ApiResponse<FieldWorkAssetDto>> getAssetById(@PathVariable UUID assetId) {
        log.info("GET /api/v1/fieldwork/assets/{}", assetId);
        FieldWorkAssetDto asset = fieldJobService.getAssetById(assetId);
        return ResponseEntity.ok(ApiResponse.ok(asset, "Field work asset retrieved successfully"));
    }

    // Field Job Notes
    @GetMapping("/jobs/{jobId}/notes")
    @PreAuthorize("hasAuthority('FIELDWORK_VIEW')")
    public ResponseEntity<ApiResponse<Page<FieldJobNoteDto>>> getJobNotes(
            @PathVariable UUID jobId,
            @PageableDefault(size = 20, page = 0, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/v1/fieldwork/jobs/{}/notes", jobId);
        Page<FieldJobNoteDto> notes = fieldJobService.getJobNotes(jobId, pageable);
        return ResponseEntity.ok(ApiResponse.ok(notes, "Field job notes retrieved successfully"));
    }

    @PostMapping("/jobs/{jobId}/notes")
    @PreAuthorize("hasAuthority('FIELDWORK_UPDATE')")
    public ResponseEntity<ApiResponse<FieldJobNoteDto>> createJobNote(@PathVariable UUID jobId, @Valid @RequestBody CreateFieldJobNoteRequest request) {
        log.info("POST /api/v1/fieldwork/jobs/{}/notes - Creating job note", jobId);
        ApiResponse<FieldJobNoteDto> response = fieldJobService.createJobNote(jobId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Dashboard and Analytics
    @GetMapping("/dashboard/overview")
    @PreAuthorize("hasAuthority('FIELDWORK_VIEW')")
    public ResponseEntity<ApiResponse<Object>> getDashboardOverview(@RequestParam UUID tenantId) {
        log.info("GET /api/v1/fieldwork/dashboard/overview - tenantId: {}", tenantId);
        Object overview = fieldJobService.getDashboardOverview(tenantId);
        return ResponseEntity.ok(ApiResponse.ok(overview, "Fieldwork dashboard overview retrieved successfully"));
    }

    @GetMapping("/jobs/summary")
    @PreAuthorize("hasAuthority('FIELDWORK_VIEW')")
    public ResponseEntity<ApiResponse<Object>> getJobsSummary(@RequestParam UUID tenantId) {
        log.info("GET /api/v1/fieldwork/jobs/summary - tenantId: {}", tenantId);
        Object summary = fieldJobService.getJobsSummary(tenantId);
        return ResponseEntity.ok(ApiResponse.ok(summary, "Field jobs summary retrieved successfully"));
    }
}
