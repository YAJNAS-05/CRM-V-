package com.everx.fieldwork.controller;

import com.everx.fieldwork.dto.*;
import com.everx.fieldwork.entity.FieldJob;
import com.everx.fieldwork.service.FieldJobService;
import com.everx.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/fieldwork/jobs")
@Validated
@Slf4j
public class FieldJobController {

    private final FieldJobService fieldJobService;

    public FieldJobController(FieldJobService fieldJobService) {
        this.fieldJobService = fieldJobService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('FIELDWORK_VIEW')")
    public ResponseEntity<ApiResponse<Page<FieldJobDto>>> getAllFieldJobs(
            @PageableDefault(size = 20, page = 0, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/v1/fieldwork/jobs");
        
        ApiResponse<Page<FieldJobDto>> response = fieldJobService.getAllFieldJobs(pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{jobId}")
    @PreAuthorize("hasAuthority('FIELDWORK_VIEW')")
    public ResponseEntity<ApiResponse<FieldJobDto>> getFieldJobById(@PathVariable UUID jobId) {
        log.info("GET /api/v1/fieldwork/jobs/{}", jobId);
        
        ApiResponse<FieldJobDto> response = fieldJobService.getFieldJobById(jobId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/number/{jobNumber}")
    @PreAuthorize("hasAuthority('FIELDWORK_VIEW')")
    public ResponseEntity<ApiResponse<FieldJobDto>> getFieldJobByJobNumber(@PathVariable String jobNumber) {
        log.info("GET /api/v1/fieldwork/jobs/number/{}", jobNumber);
        
        ApiResponse<FieldJobDto> response = fieldJobService.getFieldJobByJobNumber(jobNumber);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('FIELDWORK_CREATE')")
    public ResponseEntity<ApiResponse<FieldJobDto>> createFieldJob(@Valid @RequestBody CreateFieldJobRequest request) {
        log.info("POST /api/v1/fieldwork/jobs - Creating job: {}", request.getTitle());
        
        ApiResponse<FieldJobDto> response = fieldJobService.createFieldJob(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{jobId}")
    @PreAuthorize("hasAuthority('FIELDWORK_EDIT')")
    public ResponseEntity<ApiResponse<FieldJobDto>> updateFieldJob(
            @PathVariable UUID jobId, 
            @Valid @RequestBody UpdateFieldJobRequest request) {
        log.info("PUT /api/v1/fieldwork/jobs/{} - Updating job", jobId);
        
        ApiResponse<FieldJobDto> response = fieldJobService.updateFieldJob(jobId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{jobId}")
    @PreAuthorize("hasAuthority('FIELDWORK_DELETE')")
    public ResponseEntity<ApiResponse<Void>> deleteFieldJob(@PathVariable UUID jobId) {
        log.info("DELETE /api/v1/fieldwork/jobs/{}", jobId);
        
        ApiResponse<Void> response = fieldJobService.deleteFieldJob(jobId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{jobId}/status")
    @PreAuthorize("hasAuthority('FIELDWORK_EDIT')")
    public ResponseEntity<ApiResponse<FieldJobDto>> updateJobStatus(
            @PathVariable UUID jobId,
            @Valid @RequestBody UpdateJobStatusRequest request) {
        log.info("PUT /api/v1/fieldwork/jobs/{}/status - Updating status to {}", jobId, request.getNewStatus());
        
        ApiResponse<FieldJobDto> response = fieldJobService.updateJobStatus(jobId, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/search")
    @PreAuthorize("hasAuthority('FIELDWORK_VIEW')")
    public ResponseEntity<ApiResponse<Page<FieldJobDto>>> searchFieldJobs(
            @Valid @RequestBody FieldJobSearchRequest request,
            @PageableDefault(size = 20, page = 0, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("POST /api/v1/fieldwork/jobs/search - Searching with criteria: {}", request);
        
        ApiResponse<Page<FieldJobDto>> response = fieldJobService.searchFieldJobs(request, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/technician/{technicianId}")
    @PreAuthorize("hasAuthority('FIELDWORK_VIEW')")
    public ResponseEntity<ApiResponse<List<FieldJobDto>>> getJobsByTechnician(
            @PathVariable String technicianId,
            @RequestParam(required = false) String status) {
        log.info("GET /api/v1/fieldwork/jobs/technician/{}", technicianId);
        
        FieldJob.JobStatus[] statuses = status != null ? 
                new FieldJob.JobStatus[]{FieldJob.JobStatus.valueOf(status)} : 
                new FieldJob.JobStatus[0];
        
        ApiResponse<List<FieldJobDto>> response = fieldJobService.getJobsByTechnician(technicianId, statuses);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/overdue")
    @PreAuthorize("hasAuthority('FIELDWORK_VIEW')")
    public ResponseEntity<ApiResponse<List<FieldJobDto>>> getOverdueJobs() {
        log.info("GET /api/v1/fieldwork/jobs/overdue");
        
        ApiResponse<List<FieldJobDto>> response = fieldJobService.getOverdueJobs();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/attention")
    @PreAuthorize("hasAuthority('FIELDWORK_VIEW')")
    public ResponseEntity<ApiResponse<List<FieldJobDto>>> getJobsRequiringAttention() {
        log.info("GET /api/v1/fieldwork/jobs/attention");
        
        ApiResponse<List<FieldJobDto>> response = fieldJobService.getJobsRequiringAttention();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/technician/{technicianId}/schedule")
    @PreAuthorize("hasAuthority('FIELDWORK_VIEW')")
    public ResponseEntity<ApiResponse<FieldJobScheduleDto>> getTechnicianSchedule(
            @PathVariable String technicianId,
            @RequestParam LocalDateTime startDate,
            @RequestParam LocalDateTime endDate) {
        log.info("GET /api/v1/fieldwork/jobs/technician/{}/schedule", technicianId);
        
        ApiResponse<FieldJobScheduleDto> response = fieldJobService.getTechnicianSchedule(technicianId, startDate, endDate);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/available-technicians")
    @PreAuthorize("hasAuthority('FIELDWORK_VIEW')")
    public ResponseEntity<ApiResponse<List<TechnicianAvailabilityDto>>> getAvailableTechnicians(
            @RequestParam LocalDateTime startDate,
            @RequestParam LocalDateTime endDate,
            @RequestParam(required = false) String requiredSkills) {
        log.info("GET /api/v1/fieldwork/jobs/available-technicians");
        
        ApiResponse<List<TechnicianAvailabilityDto>> response = fieldJobService.getAvailableTechnicians(startDate, endDate, requiredSkills);
        return ResponseEntity.ok(response);
    }
}
