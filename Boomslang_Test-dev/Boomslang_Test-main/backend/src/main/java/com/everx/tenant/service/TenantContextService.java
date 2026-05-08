package com.everx.tenant.service;

import com.everx.tenant.entity.Tenant;
import com.everx.tenant.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TenantContextService {

    private final TenantRepository tenantRepository;
    
    private static final ThreadLocal<UUID> currentTenant = new ThreadLocal<>();
    private static final ThreadLocal<String> currentSubdomain = new ThreadLocal<>();

    public void setCurrentTenant(UUID tenantId) {
        currentTenant.set(tenantId);
        log.debug("Set current tenant context: {}", tenantId);
    }

    public void setCurrentSubdomain(String subdomain) {
        currentSubdomain.set(subdomain);
        log.debug("Set current subdomain context: {}", subdomain);
    }

    public UUID getCurrentTenantId() {
        return currentTenant.get();
    }

    public String getCurrentSubdomain() {
        return currentSubdomain.get();
    }

    public boolean hasTenantContext() {
        return currentTenant.get() != null;
    }

    @Transactional(readOnly = true)
    public Tenant getCurrentTenant() {
        UUID tenantId = currentTenant.get();
        if (tenantId == null) {
            throw new IllegalStateException("No tenant context set");
        }
        
        return tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found: " + tenantId));
    }

    public void clear() {
        currentTenant.remove();
        currentSubdomain.remove();
        log.debug("Cleared tenant context");
    }

    @Transactional(readOnly = true)
    public Tenant validateTenantAccess(UUID tenantId) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found: " + tenantId));
        
        if (!tenant.getIsActive()) {
            throw new RuntimeException("Tenant is not active: " + tenantId);
        }
        
        if (tenant.isTrialExpired()) {
            throw new RuntimeException("Tenant trial has expired: " + tenantId);
        }
        
        return tenant;
    }

    @Transactional(readOnly = true)
    public Tenant validateTenantBySubdomain(String subdomain) {
        Tenant tenant = tenantRepository.findBySubdomain(subdomain)
                .orElseThrow(() -> new RuntimeException("Tenant not found for subdomain: " + subdomain));
        
        if (!tenant.getIsActive()) {
            throw new RuntimeException("Tenant is not active: " + subdomain);
        }
        
        if (tenant.isTrialExpired()) {
            throw new RuntimeException("Tenant trial has expired: " + subdomain);
        }
        
        return tenant;
    }

    public void checkFeatureAccess(String feature) {
        if (!hasTenantContext()) {
            throw new IllegalStateException("No tenant context set");
        }
        
        Tenant tenant = getCurrentTenant();
        if (!tenant.hasFeature(feature)) {
            throw new RuntimeException("Feature not available for current tenant: " + feature);
        }
    }

    public void checkUserLimit() {
        if (!hasTenantContext()) {
            throw new IllegalStateException("No tenant context set");
        }
        
        Tenant tenant = getCurrentTenant();
        if (!tenant.canAddUser()) {
            throw new RuntimeException("User limit reached for tenant: " + tenant.getMaxUsers());
        }
    }

    public void checkStorageLimit(Double additionalGb) {
        if (!hasTenantContext()) {
            throw new IllegalStateException("No tenant context set");
        }
        
        Tenant tenant = getCurrentTenant();
        if (!tenant.hasStorageAvailable(additionalGb)) {
            throw new RuntimeException("Storage limit reached for tenant: " + tenant.getMaxStorageGb() + "GB");
        }
    }

    public String getTenantSchema() {
        if (!hasTenantContext()) {
            throw new IllegalStateException("No tenant context set");
        }
        
        return "tenant_" + getCurrentTenantId();
    }

    public String getTenantDatabaseUrl() {
        if (!hasTenantContext()) {
            throw new IllegalStateException("No tenant context set");
        }
        
        Tenant tenant = getCurrentTenant();
        // This would be configured based on your database setup
        return "jdbc:postgresql://localhost:5432/everx_tenant_" + tenant.getSubdomain();
    }
}
