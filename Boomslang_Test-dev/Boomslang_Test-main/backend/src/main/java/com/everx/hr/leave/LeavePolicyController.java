package com.everx.hr.leave;

import com.everx.hr.leave.dto.CreateLeavePolicyRequest;
import com.everx.hr.leave.dto.LeavePolicyDto;
import com.everx.hr.leave.dto.UpdateLeavePolicyRequest;
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
@RequestMapping("/api/v1/hr/leave-policies")
@RequiredArgsConstructor
public class LeavePolicyController {

    private final LeavePolicyService leavePolicyService;

    @PostMapping
    public ResponseEntity<ApiResponse<LeavePolicyDto>> createPolicy(@Valid @RequestBody CreateLeavePolicyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(leavePolicyService.createPolicy(request), "Leave policy created"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LeavePolicyDto>> getPolicy(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(leavePolicyService.getPolicy(id)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<LeavePolicyDto>>> getPolicies(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(leavePolicyService.getPolicies(pageable)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<LeavePolicyDto>> updatePolicy(
            @PathVariable UUID id,
            @RequestBody UpdateLeavePolicyRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(leavePolicyService.updatePolicy(id, request), "Leave policy updated"));
    }

    @PatchMapping("/{id}/active")
    public ResponseEntity<ApiResponse<LeavePolicyDto>> togglePolicy(
            @PathVariable UUID id,
            @RequestParam boolean active) {
        return ResponseEntity.ok(ApiResponse.ok(leavePolicyService.togglePolicy(id, active), "Leave policy updated"));
    }
}
