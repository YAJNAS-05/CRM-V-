package com.everx.hr.payroll;

import com.everx.hr.payroll.dto.CreatePayrollRunRequest;
import com.everx.hr.payroll.dto.PayrollProfileDto;
import com.everx.hr.payroll.dto.PayrollRunDto;
import com.everx.hr.payroll.dto.UpdatePayrollProfileRequest;
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
@RequestMapping("/api/v1/hr")
@RequiredArgsConstructor
public class PayrollController {

    private final PayrollService payrollService;

    @PutMapping("/payroll-profiles")
    public ResponseEntity<ApiResponse<PayrollProfileDto>> upsertPayrollProfile(
            @Valid @RequestBody UpdatePayrollProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(payrollService.upsertPayrollProfile(request), "Payroll profile saved"));
    }

    @GetMapping("/payroll-profiles/{employeeId}")
    public ResponseEntity<ApiResponse<PayrollProfileDto>> getPayrollProfile(@PathVariable UUID employeeId) {
        return ResponseEntity.ok(ApiResponse.ok(payrollService.getPayrollProfileByEmployee(employeeId)));
    }

    @PostMapping("/payroll-runs")
    public ResponseEntity<ApiResponse<PayrollRunDto>> createPayrollRun(@Valid @RequestBody CreatePayrollRunRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(payrollService.createPayrollRun(request), "Payroll run created"));
    }

    @GetMapping("/payroll-runs/{id}")
    public ResponseEntity<ApiResponse<PayrollRunDto>> getPayrollRun(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(payrollService.getPayrollRun(id)));
    }

    @GetMapping("/payroll-runs")
    public ResponseEntity<ApiResponse<Page<PayrollRunDto>>> getPayrollRuns(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(payrollService.getPayrollRuns(pageable)));
    }

    @PatchMapping("/payroll-runs/{id}/approve")
    public ResponseEntity<ApiResponse<PayrollRunDto>> approvePayrollRun(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(payrollService.approvePayrollRun(id), "Payroll run approved"));
    }

    @PatchMapping("/payroll-runs/{id}/pay")
    public ResponseEntity<ApiResponse<PayrollRunDto>> markPayrollRunPaid(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(payrollService.markPayrollRunPaid(id), "Payroll run marked paid"));
    }
}
