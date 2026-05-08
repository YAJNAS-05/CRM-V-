package com.everx.tenant.controller;

import com.everx.shared.dto.ApiResponse;
import com.everx.tenant.dto.*;
import com.everx.tenant.service.TenantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tenants")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Tenant Management", description = "APIs for managing multi-tenant organizations")
public class TenantController {

    private final TenantService tenantService;

    @PostMapping
    @Operation(summary = "Create a new tenant", description = "Creates a new tenant/organization with trial subscription")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TenantDto>> createTenant(
            @Valid @RequestBody CreateTenantRequest request,
            @Parameter(hidden = true) @RequestHeader(value = "X-User-Id", required = false) UUID userId) {
        
        log.info("Creating new tenant: {}", request.getName());
        TenantDto tenant = tenantService.createTenant(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(tenant, "Tenant created successfully"));
    }

    @GetMapping("/{tenantId}")
    @Operation(summary = "Get tenant by ID", description = "Retrieves tenant details by ID")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or @tenantSecurityService.canAccessTenant(#tenantId, authentication)")
    public ResponseEntity<ApiResponse<TenantDto>> getTenant(
            @Parameter(description = "Tenant ID") @PathVariable UUID tenantId) {
        
        TenantDto tenant = tenantService.getTenantById(tenantId);
        return ResponseEntity.ok(ApiResponse.success(tenant));
    }

    @GetMapping("/domain/{domain}")
    @Operation(summary = "Get tenant by domain", description = "Retrieves tenant details by subdomain or custom domain")
    public ResponseEntity<ApiResponse<TenantDto>> getTenantByDomain(
            @Parameter(description = "Domain (subdomain or custom domain)") @PathVariable String domain) {
        
        TenantDto tenant = tenantService.getTenantByDomain(domain);
        return ResponseEntity.ok(ApiResponse.success(tenant));
    }

    @PutMapping("/{tenantId}")
    @Operation(summary = "Update tenant", description = "Updates tenant information")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or @tenantSecurityService.canManageTenant(#tenantId, authentication)")
    public ResponseEntity<ApiResponse<TenantDto>> updateTenant(
            @Parameter(description = "Tenant ID") @PathVariable UUID tenantId,
            @Valid @RequestBody UpdateTenantRequest request) {
        
        log.info("Updating tenant: {}", tenantId);
        TenantDto tenant = tenantService.updateTenant(tenantId, request);
        return ResponseEntity.ok(ApiResponse.success(tenant, "Tenant updated successfully"));
    }

    @PutMapping("/{tenantId}/subscription")
    @Operation(summary = "Update tenant subscription", description = "Updates tenant subscription plan and limits")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> updateSubscription(
            @Parameter(description = "Tenant ID") @PathVariable UUID tenantId,
            @Valid @RequestBody UpdateSubscriptionRequest request) {
        
        log.info("Updating subscription for tenant {}: plan={}", tenantId, request.getPlan());
        tenantService.updateTenantSubscription(tenantId, request);
        return ResponseEntity.ok(ApiResponse.success(null, "Subscription updated successfully"));
    }

    @PutMapping("/{tenantId}/setup-progress")
    @Operation(summary = "Update setup progress", description = "Updates tenant setup completion progress")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or @tenantSecurityService.canAccessTenant(#tenantId, authentication)")
    public ResponseEntity<ApiResponse<Void>> updateSetupProgress(
            @Parameter(description = "Tenant ID") @PathVariable UUID tenantId,
            @Parameter(description = "Setup step (0-5)") @RequestParam int setupStep) {
        
        tenantService.updateSetupProgress(tenantId, setupStep);
        return ResponseEntity.ok(ApiResponse.success(null, "Setup progress updated"));
    }

    @PostMapping("/{tenantId}/deactivate")
    @Operation(summary = "Deactivate tenant", description = "Deactivates a tenant (soft delete)")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deactivateTenant(
            @Parameter(description = "Tenant ID") @PathVariable UUID tenantId) {
        
        log.warn("Deactivating tenant: {}", tenantId);
        tenantService.deactivateTenant(tenantId);
        return ResponseEntity.ok(ApiResponse.success(null, "Tenant deactivated successfully"));
    }

    @GetMapping
    @Operation(summary = "Get all tenants", description = "Retrieves paginated list of all tenants")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<TenantDto>>> getAllTenants(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "createdAt") String sort,
            @Parameter(description = "Sort direction") @RequestParam(defaultValue = "desc") String direction) {
        
        Sort.Direction sortDirection = direction.equalsIgnoreCase("desc") ? 
                Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sort));
        
        Page<TenantDto> tenants = tenantService.getAllTenants(pageable);
        return ResponseEntity.ok(ApiResponse.success(tenants));
    }

    @GetMapping("/search")
    @Operation(summary = "Search tenants", description = "Searches tenants by name, subdomain, or industry")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<TenantDto>>> searchTenants(
            @Parameter(description = "Search query") @RequestParam String search,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<TenantDto> tenants = tenantService.searchTenants(search, pageable);
        return ResponseEntity.ok(ApiResponse.success(tenants));
    }

    @GetMapping("/active")
    @Operation(summary = "Get active tenants", description = "Retrieves list of all active tenants")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<TenantDto>>> getActiveTenants() {
        List<TenantDto> tenants = tenantService.getActiveTenants();
        return ResponseEntity.ok(ApiResponse.success(tenants));
    }

    @GetMapping("/expired-trials")
    @Operation(summary = "Get expired trial tenants", description = "Retrieves list of tenants with expired trials")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<TenantDto>>> getExpiredTrialTenants() {
        List<TenantDto> tenants = tenantService.getExpiredTrialTenants();
        return ResponseEntity.ok(ApiResponse.success(tenants));
    }

    @GetMapping("/stats")
    @Operation(summary = "Get tenant statistics", description = "Retrieves tenant statistics and metrics")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TenantStatsDto>> getTenantStats() {
        TenantStatsDto stats = tenantService.getTenantStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
