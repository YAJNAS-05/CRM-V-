package com.everx.finance.period;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for posting period management.
 * 
 * Handles operations to close/open fiscal periods, preventing transactions in closed periods.
 * Requires FINANCE_EDIT permission to manage periods.
 */
@RestController
@RequestMapping("/api/v1/finance/posting-periods")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('FINANCE_EDIT')")
public class PostingPeriodController {

    private final PostingPeriodService postingPeriodService;

    /**
     * Close a posting period, preventing new transactions from being recorded.
     * 
     * Request body example:
     * {
     *   "companyCode": "AU01",
     *   "fiscalYear": 2026,
     *   "period": 1
     * }
     * 
     * @param request Contains company_code, fiscal_year, period
     * @return Closed period with HTTP 200 OK
     */
    @PostMapping("/close")
    public ResponseEntity<Void> closePeriod(@RequestBody PostingPeriodRequest request) {
        String currentUser = getCurrentUser();
        postingPeriodService.closePeriod(
            request.getCompanyCode(), 
            request.getFiscalYear(), 
            request.getPeriod(),
            currentUser
        );
        return ResponseEntity.ok().build();
    }

    /**
     * Open a previously closed posting period for corrections.
     * 
     * Request body example:
     * {
     *   "companyCode": "AU01",
     *   "fiscalYear": 2026,
     *   "period": 1
     * }
     * 
     * @param request Contains company_code, fiscal_year, period
     * @return Empty response with HTTP 204 No Content
     */
    @PostMapping("/open")
    public ResponseEntity<Void> openPeriod(@RequestBody PostingPeriodRequest request) {
        postingPeriodService.openPeriod(
            request.getCompanyCode(), 
            request.getFiscalYear(), 
            request.getPeriod()
        );
        return ResponseEntity.noContent().build();
    }

    /**
     * Get the current authenticated user name.
     */
    private String getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null ? auth.getName() : "SYSTEM";
    }
}

