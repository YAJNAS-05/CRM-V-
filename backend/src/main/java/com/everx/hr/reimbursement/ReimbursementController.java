package com.everx.hr.reimbursement;

import com.everx.hr.ReimbursementStatus;
import com.everx.hr.reimbursement.dto.CreateReimbursementRequest;
import com.everx.hr.reimbursement.dto.ReimbursementRequestDto;
import com.everx.hr.reimbursement.dto.UpdateReimbursementRequest;
import com.everx.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/hr/reimbursements")
@RequiredArgsConstructor
public class ReimbursementController {

    private final ReimbursementService reimbursementService;

    @PostMapping
    @PreAuthorize("hasAuthority('HR_REIMBURSEMENT_CREATE')")
    public ResponseEntity<ApiResponse<ReimbursementRequestDto>> createReimbursement(
            @Valid @RequestBody CreateReimbursementRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(reimbursementService.createReimbursement(request), "Reimbursement created"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('HR_REIMBURSEMENT_VIEW')")
    public ResponseEntity<ApiResponse<ReimbursementRequestDto>> getReimbursement(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(reimbursementService.getReimbursement(id)));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('HR_REIMBURSEMENT_VIEW')")
    public ResponseEntity<ApiResponse<Page<ReimbursementRequestDto>>> getReimbursements(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) ReimbursementStatus status,
            @RequestParam(required = false) UUID requestedBy,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                reimbursementService.getReimbursements(pageable, search, status, requestedBy, startDate, endDate)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('HR_REIMBURSEMENT_CREATE') or hasAuthority('HR_EDIT')")
    public ResponseEntity<ApiResponse<ReimbursementRequestDto>> updateReimbursement(
            @PathVariable UUID id,
            @RequestBody UpdateReimbursementRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                reimbursementService.updateReimbursement(id, request), "Reimbursement updated"));
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAuthority('HR_REIMBURSEMENT_APPROVE')")
    public ResponseEntity<ApiResponse<ReimbursementRequestDto>> approveReimbursement(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(
                reimbursementService.approveReimbursement(id), "Reimbursement approved"));
    }
}
