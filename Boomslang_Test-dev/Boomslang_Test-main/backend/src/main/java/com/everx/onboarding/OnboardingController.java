package com.everx.onboarding.controller;

import com.everx.shared.dto.ApiResponse;
import com.everx.onboarding.dto.*;
import com.everx.onboarding.service.OnboardingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/onboarding")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Customer Onboarding", description = "APIs for customer onboarding and setup")
public class OnboardingController {

    private final OnboardingService onboardingService;

    @PostMapping("/start")
    @Operation(summary = "Start onboarding process", description = "Initiates the onboarding process by creating a tenant")
    public ResponseEntity<ApiResponse<OnboardingResponseDto>> startOnboarding(
            @Valid @RequestBody StartOnboardingRequest request) {
        
        log.info("Starting onboarding for company: {}", request.getCompanyName());
        OnboardingResponseDto response = onboardingService.startOnboarding(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Onboarding started successfully"));
    }

    @PostMapping("/{tenantId}/admin-user")
    @Operation(summary = "Create admin user", description = "Creates the admin user for the tenant")
    public ResponseEntity<ApiResponse<OnboardingResponseDto>> createAdminUser(
            @Parameter(description = "Tenant ID") @PathVariable UUID tenantId,
            @Valid @RequestBody CreateAdminUserRequest request) {
        
        log.info("Creating admin user for tenant: {}", tenantId);
        OnboardingResponseDto response = onboardingService.createAdminUser(tenantId, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Admin user created successfully"));
    }

    @PutMapping("/{tenantId}/company-profile")
    @Operation(summary = "Update company profile", description = "Updates the company profile during onboarding")
    public ResponseEntity<ApiResponse<OnboardingResponseDto>> updateCompanyProfile(
            @Parameter(description = "Tenant ID") @PathVariable UUID tenantId,
            @Valid @RequestBody UpdateCompanyProfileRequest request) {
        
        log.info("Updating company profile for tenant: {}", tenantId);
        OnboardingResponseDto response = onboardingService.updateCompanyProfile(tenantId, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Company profile updated successfully"));
    }

    @PostMapping("/{tenantId}/import-data")
    @Operation(summary = "Import initial data", description = "Imports initial data during onboarding")
    public ResponseEntity<ApiResponse<OnboardingResponseDto>> importInitialData(
            @Parameter(description = "Tenant ID") @PathVariable UUID tenantId,
            @Valid @RequestBody ImportDataRequest request) {
        
        log.info("Importing initial data for tenant: {}", tenantId);
        OnboardingResponseDto response = onboardingService.importInitialData(tenantId, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Data imported successfully"));
    }

    @PutMapping("/{tenantId}/configure-settings")
    @Operation(summary = "Configure settings", description = "Configures final settings during onboarding")
    public ResponseEntity<ApiResponse<OnboardingResponseDto>> configureSettings(
            @Parameter(description = "Tenant ID") @PathVariable UUID tenantId,
            @Valid @RequestBody ConfigureSettingsRequest request) {
        
        log.info("Configuring settings for tenant: {}", tenantId);
        OnboardingResponseDto response = onboardingService.configureSettings(tenantId, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Settings configured successfully"));
    }

    @GetMapping("/{tenantId}/status")
    @Operation(summary = "Get onboarding status", description = "Retrieves the current onboarding status")
    public ResponseEntity<ApiResponse<OnboardingStatusDto>> getOnboardingStatus(
            @Parameter(description = "Tenant ID") @PathVariable UUID tenantId) {
        
        OnboardingStatusDto status = onboardingService.getOnboardingStatus(tenantId);
        return ResponseEntity.ok(ApiResponse.success(status));
    }

    @GetMapping("/steps")
    @Operation(summary = "Get onboarding steps", description = "Retrieves all onboarding steps")
    public ResponseEntity<ApiResponse<List<OnboardingStepDto>>> getOnboardingSteps() {
        List<OnboardingStepDto> steps = onboardingService.getOnboardingSteps();
        return ResponseEntity.ok(ApiResponse.success(steps));
    }

    @PostMapping("/{tenantId}/skip-step/{step}")
    @Operation(summary = "Skip onboarding step", description = "Skips a specific onboarding step")
    public ResponseEntity<ApiResponse<Void>> skipOnboardingStep(
            @Parameter(description = "Tenant ID") @PathVariable UUID tenantId,
            @Parameter(description = "Step number") @PathVariable int step) {
        
        log.info("Skipping onboarding step {} for tenant: {}", step, tenantId);
        onboardingService.skipOnboardingStep(tenantId, step);
        return ResponseEntity.ok(ApiResponse.success(null, "Step skipped successfully"));
    }

    @PostMapping("/{tenantId}/reset")
    @Operation(summary = "Reset onboarding", description = "Resets the onboarding process")
    public ResponseEntity<ApiResponse<Void>> resetOnboarding(
            @Parameter(description = "Tenant ID") @PathVariable UUID tenantId) {
        
        log.warn("Resetting onboarding for tenant: {}", tenantId);
        onboardingService.resetOnboarding(tenantId);
        return ResponseEntity.ok(ApiResponse.success(null, "Onboarding reset successfully"));
    }

    @GetMapping("/public/check-subdomain")
    @Operation(summary = "Check subdomain availability", description = "Checks if a subdomain is available")
    public ResponseEntity<ApiResponse<Boolean>> checkSubdomainAvailability(
            @Parameter(description = "Subdomain to check") @RequestParam String subdomain) {
        
        // This would check subdomain availability
        // Implementation would depend on your validation logic
        boolean available = !subdomain.matches("^(admin|www|api|mail|ftp)$") && subdomain.matches("^[a-z0-9][a-z0-9-]*[a-z0-9]$");
        return ResponseEntity.ok(ApiResponse.success(available));
    }
}
