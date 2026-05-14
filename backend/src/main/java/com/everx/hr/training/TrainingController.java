package com.everx.hr.training;

import com.everx.hr.training.dto.*;
import com.everx.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/hr/trainings")
@RequiredArgsConstructor
public class TrainingController {

    private final TrainingService trainingService;

    @PostMapping
    @PreAuthorize("hasAuthority('HR_TRAINING_CREATE')")
    public ResponseEntity<ApiResponse<TrainingDto>> create(@Valid @RequestBody CreateTrainingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(trainingService.createTraining(request), "Training created successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('HR_TRAINING_VIEW')")
    public ResponseEntity<ApiResponse<TrainingDto>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(trainingService.getById(id)));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('HR_TRAINING_VIEW')")
    public ResponseEntity<ApiResponse<Page<TrainingDto>>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) TrainingStatus status,
            @RequestParam(required = false) UUID departmentId,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(trainingService.getAll(pageable, search, status, departmentId)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('HR_TRAINING_EDIT')")
    public ResponseEntity<ApiResponse<TrainingDto>> update(
            @PathVariable UUID id,
            @RequestBody UpdateTrainingRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(trainingService.update(id, request), "Training updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('HR_TRAINING_DELETE')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        trainingService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Training deleted successfully"));
    }

    @PostMapping("/{id}/enroll")
    @PreAuthorize("hasAuthority('HR_TRAINING_ENROLL')")
    public ResponseEntity<ApiResponse<TrainingEnrollmentDto>> enroll(
            @PathVariable UUID id,
            @RequestParam UUID employeeId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(trainingService.enroll(id, employeeId), "Enrolled successfully"));
    }

    @GetMapping("/{id}/enrollments")
    @PreAuthorize("hasAuthority('HR_TRAINING_VIEW')")
    public ResponseEntity<ApiResponse<List<TrainingEnrollmentDto>>> getEnrollments(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(trainingService.getEnrollmentsByTraining(id)));
    }

    @GetMapping("/employee/{employeeId}/enrollments")
    @PreAuthorize("hasAuthority('HR_TRAINING_VIEW')")
    public ResponseEntity<ApiResponse<List<TrainingEnrollmentDto>>> getByEmployee(@PathVariable UUID employeeId) {
        return ResponseEntity.ok(ApiResponse.ok(trainingService.getEnrollmentsByEmployee(employeeId)));
    }
}
