package com.everx.finance.close;

import com.everx.finance.close.dto.ResolveMatchExceptionRequest;
import com.everx.finance.close.dto.ThreeWayMatchExceptionDto;
import com.everx.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/finance/close")
@RequiredArgsConstructor
public class FinancialCloseController {

    private final FinancialCloseService financialCloseService;

    @PostMapping("/initiate")
    @PreAuthorize("hasAuthority('FINANCE_EDIT')")
    public ResponseEntity<ApiResponse<Void>> initiateClose(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate periodEnd) {
        financialCloseService.initiateMonthEndClose(periodEnd);
        return ResponseEntity.ok(ApiResponse.okMessage("Close process initiated"));
    }

    @GetMapping("/exceptions")
    @PreAuthorize("hasAuthority('FINANCE_VIEW')")
    public ResponseEntity<ApiResponse<List<ThreeWayMatchExceptionDto>>> getExceptions(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate periodEnd) {
        return ResponseEntity.ok(ApiResponse.ok(financialCloseService.getExceptions(periodEnd)));
    }

    @PatchMapping("/exceptions/{exceptionId}/resolve")
    @PreAuthorize("hasAuthority('FINANCE_EDIT')")
    public ResponseEntity<ApiResponse<Void>> resolveException(
            @PathVariable UUID exceptionId,
            @Valid @RequestBody ResolveMatchExceptionRequest request) {
        financialCloseService.resolveException(exceptionId, request.getAction(), request.getNotes());
        return ResponseEntity.ok(ApiResponse.okMessage("Exception resolved"));
    }

    @PostMapping("/finalize")
    @PreAuthorize("hasAuthority('FINANCE_EDIT')")
    public ResponseEntity<ApiResponse<Void>> finalizeClose(
            @RequestParam String companyCode,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate periodEnd) {
        financialCloseService.closePostingPeriod(companyCode, periodEnd);
        return ResponseEntity.ok(ApiResponse.okMessage("Posting period closed"));
    }
}
