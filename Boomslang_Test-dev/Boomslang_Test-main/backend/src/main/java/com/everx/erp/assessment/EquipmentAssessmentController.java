package com.everx.erp.assessment;

import com.everx.erp.assessment.dto.CreateEquipmentAssessmentRequest;
import com.everx.erp.assessment.dto.EquipmentAssessmentDto;
import com.everx.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/erp/equipment-assessments")
@RequiredArgsConstructor
public class EquipmentAssessmentController {

    private final EquipmentAssessmentService assessmentService;

    @PostMapping
    public ResponseEntity<ApiResponse<EquipmentAssessmentDto>> create(@Valid @RequestBody CreateEquipmentAssessmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(assessmentService.create(request), "Equipment assessment created successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EquipmentAssessmentDto>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(assessmentService.getById(id)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<EquipmentAssessmentDto>>> getAll(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(assessmentService.getAll(pageable)));
    }

    @GetMapping("/acquisition/{acquisitionId}")
    public ResponseEntity<ApiResponse<Page<EquipmentAssessmentDto>>> getByAcquisition(
            @PathVariable UUID acquisitionId,
            Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.ok(assessmentService.getByAcquisition(acquisitionId, pageable)));
    }

    @GetMapping("/outcome/{outcome}")
    public ResponseEntity<ApiResponse<Page<EquipmentAssessmentDto>>> getByOutcome(
            @PathVariable String outcome,
            Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.ok(assessmentService.getByOutcome(outcome, pageable)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EquipmentAssessmentDto>> update(
            @PathVariable UUID id,
            @Valid @RequestBody CreateEquipmentAssessmentRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(assessmentService.update(id, request), "Equipment assessment updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        assessmentService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Equipment assessment deleted successfully"));
    }
}
