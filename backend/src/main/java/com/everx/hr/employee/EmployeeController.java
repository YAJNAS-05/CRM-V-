package com.everx.hr.employee;

import com.everx.hr.employee.dto.CreateEmployeeRequest;
import com.everx.hr.employee.dto.EmployeeDto;
import com.everx.hr.employee.dto.UpdateEmployeeRequest;
import com.everx.hr.EmployeeStatus;
import com.everx.hr.EmploymentType;
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
@RequestMapping("/api/v1/hr/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @PostMapping
    public ResponseEntity<ApiResponse<EmployeeDto>> createEmployee(@Valid @RequestBody CreateEmployeeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(employeeService.createEmployee(request), "Employee created successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeeDto>> getEmployeeById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(employeeService.getEmployeeById(id)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<EmployeeDto>>> getEmployees(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) EmployeeStatus status,
            @RequestParam(required = false) EmploymentType employmentType,
            @RequestParam(required = false) UUID departmentId,
            @RequestParam(required = false) UUID positionId,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                employeeService.getEmployees(pageable, search, status, employmentType, departmentId, positionId)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeeDto>> updateEmployee(
            @PathVariable UUID id,
            @RequestBody UpdateEmployeeRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(employeeService.updateEmployee(id, request), "Employee updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEmployee(@PathVariable UUID id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Employee deleted successfully"));
    }
}
