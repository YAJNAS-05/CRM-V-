package com.everx.hr.payroll;

import com.everx.hr.payroll.dto.CreatePayrollComponentRequest;
import com.everx.hr.payroll.dto.PayrollComponentDto;
import com.everx.hr.payroll.dto.UpdatePayrollComponentRequest;
import com.everx.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/hr/payroll-components")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('HR_VIEW')")
public class PayrollComponentController {

    private final PayrollComponentService payrollComponentService;

    @PostMapping
    public ResponseEntity<ApiResponse<PayrollComponentDto>> createComponent(@Valid @RequestBody CreatePayrollComponentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(payrollComponentService.createComponent(request), "Payroll component created"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PayrollComponentDto>> getComponent(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(payrollComponentService.getComponent(id)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<PayrollComponentDto>>> getComponents(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(payrollComponentService.getComponents(pageable)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PayrollComponentDto>> updateComponent(
            @PathVariable UUID id,
            @RequestBody UpdatePayrollComponentRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(payrollComponentService.updateComponent(id, request), "Payroll component updated"));
    }

    @PatchMapping("/{id}/active")
    public ResponseEntity<ApiResponse<PayrollComponentDto>> toggleComponent(
            @PathVariable UUID id,
            @RequestParam boolean active) {
        return ResponseEntity.ok(ApiResponse.ok(payrollComponentService.toggleComponent(id, active), "Payroll component updated"));
    }
}
