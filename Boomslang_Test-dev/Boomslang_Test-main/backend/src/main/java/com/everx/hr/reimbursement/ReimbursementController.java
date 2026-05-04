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
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/hr/reimbursements")
@RequiredArgsConstructor
public class ReimbursementController {

    private final ReimbursementService reimbursementService;

    @PostMapping
    public ResponseEntity<ApiResponse<ReimbursementRequestDto>> createReimbursement(
            @Valid @RequestBody CreateReimbursementRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(reimbursementService.createReimbursement(request), "Reimbursement created"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ReimbursementRequestDto>> getReimbursement(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(reimbursementService.getReimbursement(id)));
    }

    @GetMapping
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
    public ResponseEntity<ApiResponse<ReimbursementRequestDto>> updateReimbursement(
            @PathVariable UUID id,
            @RequestBody UpdateReimbursementRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                reimbursementService.updateReimbursement(id, request), "Reimbursement updated"));
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<ReimbursementRequestDto>> approveReimbursement(
            @PathVariable UUID id,
            @RequestParam UUID approvedBy) {
        return ResponseEntity.ok(ApiResponse.ok(
                reimbursementService.approveReimbursement(id, approvedBy), "Reimbursement approved"));
    }
}
