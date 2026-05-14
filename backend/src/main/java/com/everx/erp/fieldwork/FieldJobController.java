package com.everx.erp.fieldwork;

import com.everx.erp.fieldwork.dto.CreateFieldJobRequest;
import com.everx.erp.fieldwork.dto.FieldJobDto;
import com.everx.erp.fieldwork.dto.UpdateFieldJobRequest;
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
@RequestMapping("/api/field-jobs")
@RequiredArgsConstructor
public class FieldJobController {

    private final FieldJobService fieldJobService;

    @PostMapping
    public ResponseEntity<ApiResponse<FieldJobDto>> createFieldJob(@Valid @RequestBody CreateFieldJobRequest request) {
        FieldJobDto job = fieldJobService.createFieldJob(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(job, "Field job created successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FieldJobDto>> getFieldJobById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(fieldJobService.getFieldJobById(id)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<FieldJobDto>>> getFieldJobs(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(fieldJobService.getFieldJobs(pageable)));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<Page<FieldJobDto>>> getFieldJobsByStatus(
            @PathVariable FieldJobStatus status, Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(fieldJobService.getFieldJobsByStatus(status, pageable)));
    }

    @GetMapping("/priority/{priority}")
    public ResponseEntity<ApiResponse<Page<FieldJobDto>>> getFieldJobsByPriority(
            @PathVariable JobPriority priority, Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(fieldJobService.getFieldJobsByPriority(priority, pageable)));
    }

    @GetMapping("/engineer/{engineerId}")
    public ResponseEntity<ApiResponse<Page<FieldJobDto>>> getFieldJobsByEngineer(
            @PathVariable UUID engineerId, Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(fieldJobService.getFieldJobsByPrimaryEngineer(engineerId, pageable)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<FieldJobDto>> updateFieldJob(
            @PathVariable UUID id,
            @RequestBody UpdateFieldJobRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(fieldJobService.updateFieldJob(id, request), "Field job updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFieldJob(@PathVariable UUID id) {
        fieldJobService.deleteFieldJob(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Field job deleted successfully"));
    }
}
