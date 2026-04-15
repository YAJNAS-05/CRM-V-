package com.everx.erp.mapping;

import com.everx.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/erp/mappings")
@RequiredArgsConstructor
@Slf4j
public class ERPFieldMappingController {

    private final ERPFieldMappingService mappingService;

    /**
     * Get all field mappings between source and target modules
     */
    @GetMapping("/source/{sourceModule}/target/{targetModule}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<ERPFieldMapping>>> getMappingsByModules(
            @PathVariable String sourceModule,
            @PathVariable String targetModule) {
        log.info("GET mappings for {} -> {}", sourceModule, targetModule);
        List<ERPFieldMapping> mappings = mappingService.getMappingsForModules(sourceModule, targetModule);
        return ResponseEntity.ok(ApiResponse.ok(mappings, "Mappings retrieved successfully"));
    }

    /**
     * Get all field mappings for a source module
     */
    @GetMapping("/source/{sourceModule}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<ERPFieldMapping>>> getMappingsBySourceModule(
            @PathVariable String sourceModule) {
        log.info("GET mappings for source module: {}", sourceModule);
        List<ERPFieldMapping> mappings = mappingService.getMappingsForSourceModule(sourceModule);
        return ResponseEntity.ok(ApiResponse.ok(mappings, "Mappings retrieved successfully"));
    }

    /**
     * Get required field mappings for a source module
     */
    @GetMapping("/source/{sourceModule}/required")
    public ResponseEntity<ApiResponse<List<ERPFieldMapping>>> getRequiredMappings(
            @PathVariable String sourceModule) {
        log.info("GET required mappings for source module: {}", sourceModule);
        List<ERPFieldMapping> mappings = mappingService.getRequiredMappingsForModule(sourceModule);
        return ResponseEntity.ok(ApiResponse.ok(mappings, "Required mappings retrieved successfully"));
    }

    /**
     * Get available target modules for a source module
     */
    @GetMapping("/source/{sourceModule}/targets")
    public ResponseEntity<ApiResponse<List<String>>> getTargetModulesForSource(
            @PathVariable String sourceModule) {
        log.info("GET target modules for source: {}", sourceModule);
        List<String> targetModules = mappingService.getTargetModulesForSource(sourceModule);
        return ResponseEntity.ok(ApiResponse.ok(targetModules, "Target modules retrieved successfully"));
    }

    /**
     * Get lookup values for a mapped field
     */
    @GetMapping("/{sourceModule}/{targetModule}/{sourceField}/lookups")
    public ResponseEntity<ApiResponse<List<String>>> getLookupValues(
            @PathVariable String sourceModule,
            @PathVariable String targetModule,
            @PathVariable String sourceField) {
        log.info("GET lookup values for {}/{}/{}", sourceModule, targetModule, sourceField);
        List<String> values = mappingService.getLookupValuesForField(sourceModule, targetModule, sourceField);
        return ResponseEntity.ok(ApiResponse.ok(values, "Lookup values retrieved successfully"));
    }

    /**
     * Validate required mappings
     */
    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> validateMappings(
            @RequestParam String sourceModule,
            @RequestParam String targetModule,
            @RequestBody Map<String, String> fieldValues) {
        log.info("Validating mappings for {} -> {}", sourceModule, targetModule);
        ERPFieldMappingService.ValidationResult result = mappingService.validateRequiredMappings(
            sourceModule, targetModule, fieldValues);
        
        Map<String, Object> response = Map.of(
            "isValid", result.isValid(),
            "message", result.getMessage()
        );
        return ResponseEntity.ok(ApiResponse.ok(response, result.getMessage()));
    }

    /**
     * Get all mappings with pagination
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Page<ERPFieldMapping>>> getAllMappings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("GET all mappings - page: {}, size: {}", page, size);
        Pageable pageable = PageRequest.of(page, size);
        Page<ERPFieldMapping> mappings = mappingService.getAllMappings(pageable);
        return ResponseEntity.ok(ApiResponse.ok(mappings, "Mappings retrieved successfully"));
    }

    /**
     * Create a new field mapping
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ERPFieldMapping>> createMapping(
            @Valid @RequestBody CreateERPFieldMappingRequest request) {
        log.info("Creating mapping: {} -> {}/{}", request.getSourceModule(), 
                 request.getTargetModule(), request.getSourceField());
        ERPFieldMapping mapping = mappingService.createMapping(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(mapping, "Mapping created successfully"));
    }

    /**
     * Update an existing field mapping
     */
    @PutMapping("/{mappingId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ERPFieldMapping>> updateMapping(
            @PathVariable UUID mappingId,
            @Valid @RequestBody CreateERPFieldMappingRequest request) {
        log.info("Updating mapping: {}", mappingId);
        ERPFieldMapping mapping = mappingService.updateMapping(mappingId, request);
        return ResponseEntity.ok(ApiResponse.ok(mapping, "Mapping updated successfully"));
    }

    /**
     * Deactivate a field mapping
     */
    @PutMapping("/{mappingId}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deactivateMapping(@PathVariable UUID mappingId) {
        log.info("Deactivating mapping: {}", mappingId);
        mappingService.deactivateMapping(mappingId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Mapping deactivated successfully"));
    }

    /**
     * Delete a field mapping
     */
    @DeleteMapping("/{mappingId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteMapping(@PathVariable UUID mappingId) {
        log.info("Deleting mapping: {}", mappingId);
        mappingService.deleteMapping(mappingId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Mapping deleted successfully"));
    }
}
