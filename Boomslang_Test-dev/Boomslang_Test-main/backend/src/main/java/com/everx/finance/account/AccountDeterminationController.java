package com.everx.finance.account;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

/**
 * REST Controller for GL account determination configuration.
 * 
 * Manages mappings between transaction keys, valuation classes, and GL accounts.
 * Enables runtime configuration without code changes.
 * Access is controlled via FINANCE_* permissions.
 */
@RestController
@RequestMapping("/api/v1/finance/account-determinations")
@RequiredArgsConstructor
public class AccountDeterminationController {

    private final AccountDeterminationService accountDeterminationService;
    private final AccountDeterminationRepository accountDeterminationRepository;

    /**
     * Get all account determinations for a company.
     * 
     * Example:
     * GET /api/v1/finance/account-determinations?company=AU01
     * 
     * @param companyCode Filter by company code
     * @return List of all account determinations
     */
    @GetMapping
        @PreAuthorize("hasAuthority('FINANCE_VIEW')")
    public ResponseEntity<List<AccountDeterminationResponse>> getAll(
            @RequestParam(required = false) String companyCode) {
        List<AccountDetermination> determinations = companyCode != null
                ? accountDeterminationRepository.findByCompanyCode(companyCode)
                : accountDeterminationRepository.findAll();
        return ResponseEntity.ok(determinations.stream()
                .map(this::toResponse)
                .toList());
    }

    /**
     * Create a new account determination mapping.
     * 
     * Request body example:
     * {
     *   "companyCode": "AU01",
     *   "transactionKey": "ARC",
     *   "valuationClass": "TRADE",
     *   "glAccount": "1200"
     * }
     * 
     * @param request The account determination mapping
     * @return Created mapping with HTTP 201 Created
     */
    @PostMapping
        @PreAuthorize("hasAuthority('FINANCE_CREATE')")
    public ResponseEntity<AccountDeterminationResponse> create(
            @RequestBody CreateAccountDeterminationRequest request) {
        AccountDetermination determination = AccountDetermination.builder()
                .companyCode(request.getCompanyCode())
                .transactionKey(request.getTransactionKey())
                .valuationClass(request.getValuationClass())
                .glAccount(request.getGlAccount())
                .description(request.getDescription())
                .effectiveFrom(request.getEffectiveFrom())
                .effectiveTo(request.getEffectiveTo())
                .build();

        AccountDetermination saved = accountDeterminationRepository.save(determination);
        accountDeterminationService.invalidateCache();  // Refresh cache after creation
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(toResponse(saved));
    }

    /**
     * Update an existing account determination mapping.
     * 
     * @param id The determination ID
     * @param request Updated mapping values
     * @return Updated mapping
     */
    @PutMapping("/{id}")
        @PreAuthorize("hasAuthority('FINANCE_EDIT')")
    public ResponseEntity<AccountDeterminationResponse> update(
            @PathVariable UUID id,
            @RequestBody CreateAccountDeterminationRequest request) {
        AccountDetermination existing = accountDeterminationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Account determination not found: " + id));

        existing.setCompanyCode(request.getCompanyCode());
        existing.setTransactionKey(request.getTransactionKey());
        existing.setValuationClass(request.getValuationClass());
        existing.setGlAccount(request.getGlAccount());
        existing.setDescription(request.getDescription());
        existing.setEffectiveFrom(request.getEffectiveFrom());
        existing.setEffectiveTo(request.getEffectiveTo());

        AccountDetermination saved = accountDeterminationRepository.save(existing);
        accountDeterminationService.invalidateCache();  // Refresh cache after update
        
        return ResponseEntity.ok(toResponse(saved));
    }

    /**
     * Delete an account determination mapping.
     * 
     * @param id The determination ID
     * @return Empty response with HTTP 204 No Content
     */
    @DeleteMapping("/{id}")
        @PreAuthorize("hasAuthority('FINANCE_DELETE')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        accountDeterminationRepository.deleteById(id);
        accountDeterminationService.invalidateCache();  // Refresh cache after deletion
        return ResponseEntity.noContent().build();
    }

    private AccountDeterminationResponse toResponse(AccountDetermination determination) {
        return AccountDeterminationResponse.builder()
                .id(determination.getId())
                .companyCode(determination.getCompanyCode())
                .transactionKey(determination.getTransactionKey())
                .valuationClass(determination.getValuationClass())
                .glAccount(determination.getGlAccount())
                .description(determination.getDescription())
                .effectiveFrom(determination.getEffectiveFrom())
                .effectiveTo(determination.getEffectiveTo())
                .build();
    }
}
