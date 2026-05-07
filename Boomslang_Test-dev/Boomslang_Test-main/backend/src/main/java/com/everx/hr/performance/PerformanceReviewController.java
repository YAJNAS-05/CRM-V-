package com.everx.hr.performance;

import com.everx.hr.performance.dto.CreatePerformanceReviewRequest;
import com.everx.hr.performance.dto.PerformanceReviewDto;
import com.everx.hr.performance.dto.UpdatePerformanceReviewRequest;
import com.everx.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/hr/performance-reviews")
@RequiredArgsConstructor
public class PerformanceReviewController {

    private final PerformanceReviewService service;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<PerformanceReviewDto>>> getAll(
            @RequestParam(required = false) UUID employeeId,
            @RequestParam(required = false) UUID reviewerId,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(service.getAll(employeeId, reviewerId, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PerformanceReviewDto>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(service.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PerformanceReviewDto>> create(
            @RequestBody CreatePerformanceReviewRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(service.create(request), "Performance review created"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PerformanceReviewDto>> update(
            @PathVariable UUID id,
            @RequestBody UpdatePerformanceReviewRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(service.update(id, request), "Performance review updated"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.okMessage("Performance review deleted"));
    }
}
