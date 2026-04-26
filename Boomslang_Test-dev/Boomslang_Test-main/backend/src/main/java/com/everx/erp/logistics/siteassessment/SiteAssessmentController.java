package com.everx.erp.logistics.siteassessment;

import com.everx.erp.logistics.siteassessment.dto.CreateSiteAssessmentRequest;
import com.everx.erp.logistics.siteassessment.dto.SiteAssessmentDto;
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
@RequestMapping("/api/v1/erp/site-assessments")
@RequiredArgsConstructor
public class SiteAssessmentController {

    private final SiteAssessmentService siteAssessmentService;

    @PostMapping
    public ResponseEntity<ApiResponse<SiteAssessmentDto>> create(@Valid @RequestBody CreateSiteAssessmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(siteAssessmentService.create(request), "Site assessment created successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SiteAssessmentDto>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(siteAssessmentService.getById(id)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<SiteAssessmentDto>>> getAll(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(siteAssessmentService.getAll(pageable)));
    }

    @GetMapping("/sales-order/{salesOrderId}")
    public ResponseEntity<ApiResponse<SiteAssessmentDto>> getBySalesOrder(@PathVariable UUID salesOrderId) {
        return ResponseEntity.ok(ApiResponse.ok(siteAssessmentService.getBySalesOrder(salesOrderId)));
    }

    @GetMapping("/readiness/{readiness}")
    public ResponseEntity<ApiResponse<Page<SiteAssessmentDto>>> getByReadiness(
            @PathVariable String readiness,
            Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.ok(siteAssessmentService.getByReadiness(readiness, pageable)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SiteAssessmentDto>> update(
            @PathVariable UUID id,
            @Valid @RequestBody CreateSiteAssessmentRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(siteAssessmentService.update(id, request), "Site assessment updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        siteAssessmentService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Site assessment deleted successfully"));
    }
}
