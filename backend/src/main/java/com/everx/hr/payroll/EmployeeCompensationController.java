package com.everx.hr.payroll;

import com.everx.hr.payroll.dto.EmployeeCompensationDto;
import com.everx.hr.payroll.dto.EmployeePayrollComponentDto;
import com.everx.hr.payroll.dto.PayrollCtcBreakdownDto;
import com.everx.hr.payroll.dto.UpsertEmployeeCompensationRequest;
import com.everx.hr.payroll.dto.UpsertEmployeePayrollComponentRequest;
import com.everx.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/hr/compensation")
@RequiredArgsConstructor
public class EmployeeCompensationController {

    private final EmployeeCompensationService employeeCompensationService;

    @PutMapping
    public ResponseEntity<ApiResponse<EmployeeCompensationDto>> upsertCompensation(
            @Valid @RequestBody UpsertEmployeeCompensationRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(employeeCompensationService.upsertCompensation(request), "Compensation saved"));
    }

    @GetMapping("/{employeeId}")
    public ResponseEntity<ApiResponse<EmployeeCompensationDto>> getCompensation(@PathVariable UUID employeeId) {
        return ResponseEntity.ok(ApiResponse.ok(employeeCompensationService.getCompensation(employeeId)));
    }

    @PutMapping("/{employeeId}/components")
    public ResponseEntity<ApiResponse<List<EmployeePayrollComponentDto>>> upsertComponents(
            @PathVariable UUID employeeId,
            @Valid @RequestBody List<UpsertEmployeePayrollComponentRequest> requests) {
        return ResponseEntity.ok(ApiResponse.ok(employeeCompensationService.upsertComponents(employeeId, requests), "Components saved"));
    }

    @GetMapping("/{employeeId}/components")
    public ResponseEntity<ApiResponse<List<EmployeePayrollComponentDto>>> getComponents(@PathVariable UUID employeeId) {
        return ResponseEntity.ok(ApiResponse.ok(employeeCompensationService.getComponents(employeeId)));
    }

    @GetMapping("/{employeeId}/breakdown")
    public ResponseEntity<ApiResponse<PayrollCtcBreakdownDto>> getBreakdown(@PathVariable UUID employeeId) {
        return ResponseEntity.ok(ApiResponse.ok(employeeCompensationService.getBreakdown(employeeId)));
    }
}
