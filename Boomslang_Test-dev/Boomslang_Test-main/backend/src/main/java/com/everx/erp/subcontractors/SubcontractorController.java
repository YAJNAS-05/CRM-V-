package com.everx.erp.subcontractors;

import com.everx.erp.subcontractors.dto.CreateSubcontractorRequest;
import com.everx.erp.subcontractors.dto.SubcontractorDto;
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
@RequestMapping("/api/v1/erp/subcontractors")
@RequiredArgsConstructor
public class SubcontractorController {

    private final SubcontractorService subcontractorService;

    @PostMapping
    public ResponseEntity<ApiResponse<SubcontractorDto>> createSubcontractor(@Valid @RequestBody CreateSubcontractorRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(subcontractorService.createSubcontractor(request), "Subcontractor created successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SubcontractorDto>> getSubcontractorById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(subcontractorService.getSubcontractorById(id)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<SubcontractorDto>>> getAllSubcontractors(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(subcontractorService.getAllSubcontractors(pageable)));
    }

    @GetMapping("/country/{country}")
    public ResponseEntity<ApiResponse<Page<SubcontractorDto>>> getSubcontractorsByCountry(@PathVariable String country, Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(subcontractorService.getSubcontractorsByCountry(country, pageable)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SubcontractorDto>> updateSubcontractor(@PathVariable UUID id, @Valid @RequestBody CreateSubcontractorRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(subcontractorService.updateSubcontractor(id, request), "Subcontractor updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSubcontractor(@PathVariable UUID id) {
        subcontractorService.deleteSubcontractor(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Subcontractor deleted successfully"));
    }
}
