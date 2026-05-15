package com.everx.hr.leave;

import com.everx.hr.leave.dto.AdjustLeaveBalanceRequest;
import com.everx.hr.leave.dto.LeaveBalanceDto;
import com.everx.hr.leave.dto.SeedLeaveBalanceRequest;
import com.everx.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/hr/leave-balances")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('HR_VIEW')")
public class LeaveBalanceController {

    private final LeaveBalanceService leaveBalanceService;

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<ApiResponse<List<LeaveBalanceDto>>> getBalancesByEmployee(@PathVariable UUID employeeId) {
        return ResponseEntity.ok(ApiResponse.ok(leaveBalanceService.getBalancesByEmployee(employeeId)));
    }

    @PostMapping("/seed")
    public ResponseEntity<ApiResponse<List<LeaveBalanceDto>>> seedBalances(@Valid @RequestBody SeedLeaveBalanceRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(leaveBalanceService.seedBalances(request), "Leave balances seeded"));
    }

    @PutMapping("/adjust")
    public ResponseEntity<ApiResponse<LeaveBalanceDto>> adjustBalance(@Valid @RequestBody AdjustLeaveBalanceRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(leaveBalanceService.adjustBalance(request), "Leave balance updated"));
    }
}
