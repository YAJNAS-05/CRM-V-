package com.everx.fieldwork.controller;

import com.everx.fieldwork.dto.CreateTechnicianRequest;
import com.everx.fieldwork.dto.TechnicianDto;
import com.everx.fieldwork.dto.TechnicianPerformanceDto;
import com.everx.fieldwork.dto.UpdateTechnicianRequest;
import com.everx.fieldwork.entity.Technician;
import com.everx.fieldwork.service.TechnicianService;
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

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/fieldwork/technicians")
@Validated
@Slf4j
public class TechnicianController {

    private final TechnicianService technicianService;

    public TechnicianController(TechnicianService technicianService) {
        this.technicianService = technicianService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('FIELDWORK_VIEW')")
    public ResponseEntity<ApiResponse<Page<TechnicianDto>>> getAllTechnicians(
            @PageableDefault(size = 20, page = 0, sort = "firstName", direction = Sort.Direction.ASC) Pageable pageable) {
        log.info("GET /api/v1/fieldwork/technicians");
        
        ApiResponse<Page<TechnicianDto>> response = technicianService.getAllTechnicians(pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{technicianId}")
    @PreAuthorize("hasAuthority('FIELDWORK_VIEW')")
    public ResponseEntity<ApiResponse<TechnicianDto>> getTechnicianById(@PathVariable UUID technicianId) {
        log.info("GET /api/v1/fieldwork/technicians/{}", technicianId);
        
        ApiResponse<TechnicianDto> response = technicianService.getTechnicianById(technicianId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAuthority('FIELDWORK_VIEW')")
    public ResponseEntity<ApiResponse<TechnicianDto>> getTechnicianByEmployeeId(@PathVariable String employeeId) {
        log.info("GET /api/v1/fieldwork/technicians/employee/{}", employeeId);
        
        ApiResponse<TechnicianDto> response = technicianService.getTechnicianByEmployeeId(employeeId);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('FIELDWORK_CREATE')")
    public ResponseEntity<ApiResponse<TechnicianDto>> createTechnician(@Valid @RequestBody CreateTechnicianRequest request) {
        log.info("POST /api/v1/fieldwork/technicians - Creating technician: {}", request.getFirstName());
        
        ApiResponse<TechnicianDto> response = technicianService.createTechnician(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{technicianId}")
    @PreAuthorize("hasAuthority('FIELDWORK_EDIT')")
    public ResponseEntity<ApiResponse<TechnicianDto>> updateTechnician(
            @PathVariable UUID technicianId,
            @Valid @RequestBody UpdateTechnicianRequest request) {
        log.info("PUT /api/v1/fieldwork/technicians/{} - Updating technician", technicianId);
        
        ApiResponse<TechnicianDto> response = technicianService.updateTechnician(technicianId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{technicianId}")
    @PreAuthorize("hasAuthority('FIELDWORK_DELETE')")
    public ResponseEntity<ApiResponse<Void>> deleteTechnician(@PathVariable UUID technicianId) {
        log.info("DELETE /api/v1/fieldwork/technicians/{}", technicianId);
        
        ApiResponse<Void> response = technicianService.deleteTechnician(technicianId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/available")
    @PreAuthorize("hasAuthority('FIELDWORK_VIEW')")
    public ResponseEntity<ApiResponse<List<TechnicianDto>>> getAvailableTechnicians() {
        log.info("GET /api/v1/fieldwork/technicians/available");
        
        ApiResponse<List<TechnicianDto>> response = technicianService.getAvailableTechnicians();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    @PreAuthorize("hasAuthority('FIELDWORK_VIEW')")
    public ResponseEntity<ApiResponse<Page<TechnicianDto>>> searchTechnicians(
            @RequestParam String searchTerm,
            @PageableDefault(size = 20, page = 0, sort = "firstName", direction = Sort.Direction.ASC) Pageable pageable) {
        log.info("GET /api/v1/fieldwork/technicians/search?term={}", searchTerm);
        
        ApiResponse<Page<TechnicianDto>> response = technicianService.searchTechnicians(searchTerm, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/level/{level}")
    @PreAuthorize("hasAuthority('FIELDWORK_VIEW')")
    public ResponseEntity<ApiResponse<List<TechnicianDto>>> getTechniciansByLevel(@PathVariable Technician.TechnicianLevel level) {
        log.info("GET /api/v1/fieldwork/technicians/level/{}", level);
        
        ApiResponse<List<TechnicianDto>> response = technicianService.getTechniciansByLevel(level);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/skills/{skill}")
    @PreAuthorize("hasAuthority('FIELDWORK_VIEW')")
    public ResponseEntity<ApiResponse<List<TechnicianDto>>> getTechniciansBySkill(@PathVariable String skill) {
        log.info("GET /api/v1/fieldwork/technicians/skills/{}", skill);
        
        ApiResponse<List<TechnicianDto>> response = technicianService.getTechniciansBySkill(skill);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/location")
    @PreAuthorize("hasAuthority('FIELDWORK_VIEW')")
    public ResponseEntity<ApiResponse<List<TechnicianDto>>> getTechniciansByLocation(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(defaultValue = "50.0") Double radiusKm) {
        log.info("GET /api/v1/fieldwork/technicians/location?lat={}&lng={}&radius={}", latitude, longitude, radiusKm);
        
        ApiResponse<List<TechnicianDto>> response = technicianService.getTechniciansByLocation(latitude, longitude, radiusKm);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{technicianId}/status")
    @PreAuthorize("hasAuthority('FIELDWORK_EDIT')")
    public ResponseEntity<ApiResponse<TechnicianDto>> updateTechnicianStatus(
            @PathVariable UUID technicianId,
            @RequestParam Technician.TechnicianStatus status) {
        log.info("PUT /api/v1/fieldwork/technicians/{}/status?status={}", technicianId, status);
        
        ApiResponse<TechnicianDto> response = technicianService.updateTechnicianStatus(technicianId, status);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{technicianId}/performance")
    @PreAuthorize("hasAuthority('FIELDWORK_VIEW')")
    public ResponseEntity<ApiResponse<TechnicianPerformanceDto>> getTechnicianPerformance(@PathVariable UUID technicianId) {
        log.info("GET /api/v1/fieldwork/technicians/{}/performance", technicianId);
        
        ApiResponse<TechnicianPerformanceDto> response = technicianService.getTechnicianPerformance(technicianId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/top-performers")
    @PreAuthorize("hasAuthority('FIELDWORK_VIEW')")
    public ResponseEntity<ApiResponse<List<TechnicianDto>>> getTopPerformers(
            @RequestParam(defaultValue = "10") int limit) {
        log.info("GET /api/v1/fieldwork/technicians/top-performers?limit={}", limit);
        
        ApiResponse<List<TechnicianDto>> response = technicianService.getTopPerformers(limit);
        return ResponseEntity.ok(response);
    }
}
