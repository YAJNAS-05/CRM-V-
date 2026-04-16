package com.everx.finance.tolerance;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * REST Controller for AP invoice tolerance configuration.
 * 
 * Manages tolerance rules (% and absolute) per company for AP matching.
 * Access is controlled via FINANCE_* permissions.
 */
@RestController
@RequestMapping("/api/v1/finance/tolerance-config")
@RequiredArgsConstructor
public class InvoiceToleranceConfigController {

    private final InvoiceToleranceConfigRepository toleranceRepository;

    /**
     * Get all tolerance configurations.
     * 
     * @return List of all tolerance configs
     */
    @GetMapping
    @PreAuthorize("hasAuthority('FINANCE_VIEW')")
    public ResponseEntity<List<InvoiceToleranceConfigResponse>> getAll() {
        return ResponseEntity.ok(
            toleranceRepository.findAll().stream()
                .map(this::toResponse)
                .toList()
        );
    }

    /**
     * Get tolerance configuration for a specific company.
     * 
     * @param companyCode The company code (AU01, US01, JP01)
     * @return The tolerance config for that company
     */
    @GetMapping("/{companyCode}")
    @PreAuthorize("hasAuthority('FINANCE_VIEW')")
    public ResponseEntity<InvoiceToleranceConfigResponse> getByCompanyCode(
            @PathVariable String companyCode) {
        return toleranceRepository.findByCompanyCode(companyCode)
                .map(config -> ResponseEntity.ok(toResponse(config)))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create or update tolerance configuration for a company.
     * 
     * Request body example:
     * {
     *   "companyCode": "AU01",
     *   "tolerancePercentage": 5.0,
     *   "toleranceAbsolute": 100.00
     * }
     * 
     * @param request The tolerance config
     * @return Created/updated config with HTTP 201 Created or 200 OK
     */
    @PostMapping
    @PreAuthorize("hasAnyAuthority('FINANCE_CREATE','FINANCE_EDIT')")
    public ResponseEntity<InvoiceToleranceConfigResponse> createOrUpdate(
            @RequestBody CreateInvoiceToleranceConfigRequest request) {
        InvoiceToleranceConfig existing = toleranceRepository
                .findByCompanyCode(request.getCompanyCode())
                .orElse(null);

        InvoiceToleranceConfig config = existing != null ? existing : new InvoiceToleranceConfig();
        config.setCompanyCode(request.getCompanyCode());
        config.setTolerancePct(request.getTolerancePercentage());
        config.setToleranceAbs(request.getToleranceAbsolute());

        InvoiceToleranceConfig saved = toleranceRepository.save(config);
        return ResponseEntity.status(existing == null ? HttpStatus.CREATED : HttpStatus.OK)
                .body(toResponse(saved));
    }

    /**
     * Update an existing tolerance configuration.
     * 
     * @param id The configuration ID
     * @param request Updated values
     * @return Updated config
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('FINANCE_EDIT')")
    public ResponseEntity<InvoiceToleranceConfigResponse> update(
            @PathVariable UUID id,
            @RequestBody CreateInvoiceToleranceConfigRequest request) {
        InvoiceToleranceConfig config = toleranceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tolerance config not found: " + id));

        config.setCompanyCode(request.getCompanyCode());
        config.setTolerancePct(request.getTolerancePercentage());
        config.setToleranceAbs(request.getToleranceAbsolute());

        InvoiceToleranceConfig saved = toleranceRepository.save(config);
        return ResponseEntity.ok(toResponse(saved));
    }

    /**
     * Delete a tolerance configuration.
     * 
     * @param id The configuration ID
     * @return HTTP 204 No Content
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('FINANCE_DELETE')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        toleranceRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private InvoiceToleranceConfigResponse toResponse(InvoiceToleranceConfig config) {
        return InvoiceToleranceConfigResponse.builder()
                .id(config.getId())
                .companyCode(config.getCompanyCode())
                .tolerancePercentage(config.getTolerancePct())
                .toleranceAbsolute(config.getToleranceAbs())
                .build();
    }
}
