package com.everx.tenant.service;

import com.everx.auth.entity.User;
import com.everx.tenant.entity.Tenant;
import com.everx.tenant.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TenantSecurityService {

    private final TenantRepository tenantRepository;
    private final TenantContextService tenantContextService;

    public boolean canAccessTenant(UUID tenantId, Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            Tenant tenant = tenantRepository.findById(tenantId)
                    .orElseThrow(() -> new RuntimeException("Tenant not found"));

            // Super admins can access all tenants
            if (user.getRole().toString().equals("SUPER_ADMIN")) {
                return true;
            }

            // Regular admins can only access their own tenant
            // This assumes users have a tenantId field - you may need to adjust based on your user entity
            return user.getTenantId() != null && user.getTenantId().equals(tenantId);
        } catch (Exception e) {
            log.error("Error checking tenant access", e);
            return false;
        }
    }

    public boolean canManageTenant(UUID tenantId, Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            Tenant tenant = tenantRepository.findById(tenantId)
                    .orElseThrow(() -> new RuntimeException("Tenant not found"));

            // Super admins can manage all tenants
            if (user.getRole().toString().equals("SUPER_ADMIN")) {
                return true;
            }

            // Tenant admins can manage their own tenant
            if (user.getRole().toString().equals("ADMIN") && 
                user.getTenantId() != null && 
                user.getTenantId().equals(tenantId)) {
                return true;
            }

            return false;
        } catch (Exception e) {
            log.error("Error checking tenant management access", e);
            return false;
        }
    }

    public void setCurrentTenantFromSubdomain(String subdomain) {
        try {
            Tenant tenant = tenantContextService.validateTenantBySubdomain(subdomain);
            tenantContextService.setCurrentTenant(tenant.getId());
            tenantContextService.setCurrentSubdomain(subdomain);
        } catch (Exception e) {
            log.error("Failed to set tenant from subdomain: {}", subdomain, e);
            throw e;
        }
    }

    public void setCurrentTenantFromUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof User) {
                User user = (User) authentication.getPrincipal();
                if (user.getTenantId() != null) {
                    tenantContextService.setCurrentTenant(user.getTenantId());
                }
            }
        } catch (Exception e) {
            log.error("Failed to set tenant from user", e);
        }
    }

    public UUID getCurrentUserTenantId() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof User) {
                User user = (User) authentication.getPrincipal();
                return user.getTenantId();
            }
        } catch (Exception e) {
            log.error("Failed to get current user tenant ID", e);
        }
        return null;
    }

    public boolean isCurrentUserTenantAdmin() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof User) {
                User user = (User) authentication.getPrincipal();
                return user.getRole().toString().equals("ADMIN");
            }
        } catch (Exception e) {
            log.error("Failed to check if current user is tenant admin", e);
        }
        return false;
    }

    public boolean isCurrentUserSuperAdmin() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof User) {
                User user = (User) authentication.getPrincipal();
                return user.getRole().toString().equals("SUPER_ADMIN");
            }
        } catch (Exception e) {
            log.error("Failed to check if current user is super admin", e);
        }
        return false;
    }

    public void validateTenantAccess(UUID tenantId) {
        if (!canAccessTenant(tenantId, SecurityContextHolder.getContext().getAuthentication())) {
            throw new SecurityException("Access denied to tenant: " + tenantId);
        }
    }

    public void validateTenantManagement(UUID tenantId) {
        if (!canManageTenant(tenantId, SecurityContextHolder.getContext().getAuthentication())) {
            throw new SecurityException("Management access denied to tenant: " + tenantId);
        }
    }
}
