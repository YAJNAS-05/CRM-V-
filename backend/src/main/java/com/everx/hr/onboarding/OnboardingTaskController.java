package com.everx.hr.onboarding;

import com.everx.hr.onboarding.dto.CreateOnboardingTaskRequest;
import com.everx.hr.onboarding.dto.OnboardingTaskDto;
import com.everx.hr.onboarding.dto.UpdateOnboardingTaskRequest;
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
@RequestMapping("/api/v1/hr/onboarding-tasks")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('HR_VIEW')")
public class OnboardingTaskController {

    private final OnboardingTaskService onboardingTaskService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<OnboardingTaskDto>>> getTasks(
            @RequestParam(required = false) UUID employeeId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(onboardingTaskService.getTasks(employeeId, status, category, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OnboardingTaskDto>> getTask(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(onboardingTaskService.getTask(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OnboardingTaskDto>> createTask(@Valid @RequestBody CreateOnboardingTaskRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(onboardingTaskService.createTask(request), "Onboarding task created"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<OnboardingTaskDto>> updateTask(
            @PathVariable UUID id,
            @RequestBody UpdateOnboardingTaskRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(onboardingTaskService.updateTask(id, request), "Onboarding task updated"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTask(@PathVariable UUID id) {
        onboardingTaskService.deleteTask(id);
        return ResponseEntity.ok(ApiResponse.okMessage("Onboarding task deleted"));
    }
}
