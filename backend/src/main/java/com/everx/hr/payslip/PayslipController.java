package com.everx.hr.payslip;

import com.everx.hr.payslip.dto.CreatePayslipRequest;
import com.everx.hr.payslip.dto.PayslipDto;
import com.everx.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/hr/payslips")
@RequiredArgsConstructor
public class PayslipController {

    private final PayslipService payslipService;

    @PostMapping
    @PreAuthorize("hasAuthority('HR_PAYSLIP_CREATE')")
    public ResponseEntity<ApiResponse<PayslipDto>> create(@Valid @RequestBody CreatePayslipRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(payslipService.create(request), "Payslip generated successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('HR_PAYSLIP_VIEW')")
    public ResponseEntity<ApiResponse<PayslipDto>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(payslipService.getById(id)));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('HR_PAYSLIP_VIEW')")
    public ResponseEntity<ApiResponse<Page<PayslipDto>>> getAll(
            @RequestParam(required = false) UUID employeeId,
            @RequestParam(required = false) UUID payrollRunId,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(payslipService.getAll(pageable, employeeId, payrollRunId)));
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAuthority('HR_PAYSLIP_VIEW')")
    public ResponseEntity<ApiResponse<List<PayslipDto>>> getByEmployee(@PathVariable UUID employeeId) {
        return ResponseEntity.ok(ApiResponse.ok(payslipService.getByEmployee(employeeId)));
    }

    @PatchMapping("/{id}/acknowledge")
    @PreAuthorize("hasAuthority('HR_PAYSLIP_VIEW')")
    public ResponseEntity<ApiResponse<PayslipDto>> acknowledge(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(payslipService.acknowledge(id), "Payslip acknowledged"));
    }
}
