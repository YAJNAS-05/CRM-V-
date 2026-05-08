package com.everx.hr.okr;

import com.everx.hr.okr.dto.*;
import com.everx.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/hr/okr")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('HR_VIEW', 'HR_EDIT', 'EMPLOYEE', 'MANAGER', 'ADMIN', 'SUPER_ADMIN')")
public class OkrController {

    private final OkrService okrService;

    // ==================== OKR Cycles ====================

    @GetMapping("/cycles")
    public ResponseEntity<ApiResponse<List<OkrCycleDto>>> getAllCycles() {
        List<OkrCycleDto> cycles = okrService.getAllCycles();
        return ResponseEntity.ok(ApiResponse.ok(cycles));
    }

    @GetMapping("/cycles/{id}")
    public ResponseEntity<ApiResponse<OkrCycleDto>> getCycle(@PathVariable UUID id) {
        OkrCycleDto cycle = okrService.getCycle(id);
        return ResponseEntity.ok(ApiResponse.ok(cycle));
    }

    @PostMapping("/cycles")
    @PreAuthorize("hasAnyAuthority('HR_EDIT', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<OkrCycleDto>> createCycle(@Valid @RequestBody OkrCycleDto request) {
        OkrCycleDto created = okrService.createCycle(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(created, "OKR Cycle created successfully"));
    }

    @PutMapping("/cycles/{id}")
    @PreAuthorize("hasAnyAuthority('HR_EDIT', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<OkrCycleDto>> updateCycle(
            @PathVariable UUID id,
            @Valid @RequestBody OkrCycleDto request) {
        OkrCycleDto updated = okrService.updateCycle(id, request);
        return ResponseEntity.ok(ApiResponse.ok(updated, "OKR Cycle updated successfully"));
    }

    // ==================== Objectives ====================

    @GetMapping("/objectives")
    public ResponseEntity<ApiResponse<List<ObjectiveDto>>> getObjectives(
            @RequestParam(required = false) UUID employeeId,
            @RequestParam(required = false) UUID cycleId) {
        List<ObjectiveDto> objectives;
        if (employeeId != null) {
            objectives = okrService.getObjectivesByEmployee(employeeId);
        } else if (cycleId != null) {
            objectives = okrService.getObjectivesByCycle(cycleId);
        } else {
            return ResponseEntity.badRequest().body(ApiResponse.error("Either employeeId or cycleId is required"));
        }
        return ResponseEntity.ok(ApiResponse.ok(objectives));
    }

    @GetMapping("/objectives/{id}")
    public ResponseEntity<ApiResponse<ObjectiveDto>> getObjective(@PathVariable UUID id) {
        ObjectiveDto objective = okrService.getObjective(id);
        return ResponseEntity.ok(ApiResponse.ok(objective));
    }

    @PostMapping("/objectives")
    public ResponseEntity<ApiResponse<ObjectiveDto>> createObjective(@Valid @RequestBody CreateObjectiveRequest request) {
        ObjectiveDto created = okrService.createObjective(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(created, "Objective created successfully"));
    }

    @PutMapping("/objectives/{id}")
    public ResponseEntity<ApiResponse<ObjectiveDto>> updateObjective(
            @PathVariable UUID id,
            @Valid @RequestBody CreateObjectiveRequest request) {
        ObjectiveDto updated = okrService.updateObjective(id, request);
        return ResponseEntity.ok(ApiResponse.ok(updated, "Objective updated successfully"));
    }

    @PatchMapping("/objectives/{id}/status")
    public ResponseEntity<ApiResponse<ObjectiveDto>> updateObjectiveStatus(
            @PathVariable UUID id,
            @RequestParam String status) {
        ObjectiveDto updated = okrService.updateObjectiveStatus(id, status);
        return ResponseEntity.ok(ApiResponse.ok(updated, "Objective status updated"));
    }

    // ==================== Key Results ====================

    @PatchMapping("/key-results/{id}/progress")
    public ResponseEntity<ApiResponse<KeyResultDto>> updateKeyResultProgress(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateKeyResultProgressRequest request) {
        KeyResultDto updated = okrService.updateKeyResultProgress(id, request);
        return ResponseEntity.ok(ApiResponse.ok(updated, "Key Result progress updated"));
    }
}
