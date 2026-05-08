package com.everx.tenant.service;

import com.everx.tenant.dto.*;
import com.everx.tenant.entity.Tenant;
import com.everx.tenant.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class TenantService {

    private final TenantRepository tenantRepository;

    private static final Pattern SUBDOMAIN_PATTERN = Pattern.compile("^[a-z0-9][a-z0-9-]*[a-z0-9]$");
    private static final Pattern DOMAIN_PATTERN = Pattern.compile("^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]\\.[a-zA-Z]{2,}$");

    @Transactional
    public TenantDto createTenant(CreateTenantRequest request, UUID createdByUserId) {
        log.info("Creating new tenant: {}", request.getName());

        // Validate subdomain
        if (!isValidSubdomain(request.getSubdomain())) {
            throw new IllegalArgumentException("Invalid subdomain format");
        }

        if (tenantRepository.existsBySubdomain(request.getSubdomain())) {
            throw new IllegalArgumentException("Subdomain already exists");
        }

        // Validate custom domain if provided
        if (request.getCustomDomain() != null && !request.getCustomDomain().trim().isEmpty()) {
            if (!isValidDomain(request.getCustomDomain())) {
                throw new IllegalArgumentException("Invalid custom domain format");
            }
            if (tenantRepository.existsByCustomDomain(request.getCustomDomain())) {
                throw new IllegalArgumentException("Custom domain already exists");
            }
        }

        Tenant tenant = Tenant.builder()
                .name(request.getName())
                .subdomain(request.getSubdomain().toLowerCase())
                .customDomain(request.getCustomDomain())
                .industry(request.getIndustry())
                .companySize(request.getCompanySize())
                .description(request.getDescription())
                .timezone(request.getTimezone() != null ? request.getTimezone() : "UTC")
                .locale(request.getLocale() != null ? request.getLocale() : "en_US")
                .currency(request.getCurrency() != null ? request.getCurrency() : "USD")
                .billingEmail(request.getBillingEmail())
                .technicalContactEmail(request.getTechnicalContactEmail())
                .address(request.getAddress())
                .phone(request.getPhone())
                .website(request.getWebsite())
                .isTrial(true)
                .trialEndDate(LocalDateTime.now().plusDays(14))
                .subscriptionPlan("TRIAL")
                .maxUsers(10)
                .maxStorageGb(5)
                .createdByUserId(createdByUserId)
                .setupStep(0)
                .build();

        tenant = tenantRepository.save(tenant);
        log.info("Successfully created tenant with ID: {}", tenant.getId());

        return convertToDto(tenant);
    }

    @Transactional(readOnly = true)
    public TenantDto getTenantById(UUID tenantId) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));
        return convertToDto(tenant);
    }

    @Transactional(readOnly = true)
    public TenantDto getTenantByDomain(String domain) {
        // Try custom domain first, then subdomain
        return tenantRepository.findByCustomDomain(domain)
                .or(() -> {
                    // Extract subdomain from full domain if it's a subdomain of everx.com
                    if (domain.endsWith(".everx.com")) {
                        String subdomain = domain.substring(0, domain.length() - ".everx.com".length());
                        return tenantRepository.findBySubdomain(subdomain);
                    }
                    return tenantRepository.findBySubdomain(domain);
                })
                .map(this::convertToDto)
                .orElseThrow(() -> new RuntimeException("Tenant not found for domain: " + domain));
    }

    @Transactional
    public TenantDto updateTenant(UUID tenantId, UpdateTenantRequest request) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));

        // Update fields
        if (request.getName() != null) {
            tenant.setName(request.getName());
        }
        if (request.getIndustry() != null) {
            tenant.setIndustry(request.getIndustry());
        }
        if (request.getCompanySize() != null) {
            tenant.setCompanySize(request.getCompanySize());
        }
        if (request.getDescription() != null) {
            tenant.setDescription(request.getDescription());
        }
        if (request.getLogoUrl() != null) {
            tenant.setLogoUrl(request.getLogoUrl());
        }
        if (request.getPrimaryColor() != null) {
            tenant.setPrimaryColor(request.getPrimaryColor());
        }
        if (request.getSecondaryColor() != null) {
            tenant.setSecondaryColor(request.getSecondaryColor());
        }
        if (request.getTimezone() != null) {
            tenant.setTimezone(request.getTimezone());
        }
        if (request.getLocale() != null) {
            tenant.setLocale(request.getLocale());
        }
        if (request.getCurrency() != null) {
            tenant.setCurrency(request.getCurrency());
        }
        if (request.getDateFormat() != null) {
            tenant.setDateFormat(request.getDateFormat());
        }
        if (request.getTimeFormat() != null) {
            tenant.setTimeFormat(request.getTimeFormat());
        }
        if (request.getBillingEmail() != null) {
            tenant.setBillingEmail(request.getBillingEmail());
        }
        if (request.getTechnicalContactEmail() != null) {
            tenant.setTechnicalContactEmail(request.getTechnicalContactEmail());
        }
        if (request.getAddress() != null) {
            tenant.setAddress(request.getAddress());
        }
        if (request.getPhone() != null) {
            tenant.setPhone(request.getPhone());
        }
        if (request.getWebsite() != null) {
            tenant.setWebsite(request.getWebsite());
        }
        if (request.getNotes() != null) {
            tenant.setNotes(request.getNotes());
        }

        tenant = tenantRepository.save(tenant);
        return convertToDto(tenant);
    }

    @Transactional
    public void updateTenantSubscription(UUID tenantId, UpdateSubscriptionRequest request) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));

        tenant.setSubscriptionPlan(request.getPlan());
        tenant.setMaxUsers(request.getMaxUsers());
        tenant.setMaxStorageGb(request.getMaxStorageGb());
        tenant.setFeaturesEnabled(String.join(",", request.getFeatures()));
        
        if (request.getTrialEndDate() != null) {
            tenant.setTrialEndDate(request.getTrialEndDate());
        }

        tenantRepository.save(tenant);
        log.info("Updated subscription for tenant {}: plan={}, maxUsers={}", 
                tenantId, request.getPlan(), request.getMaxUsers());
    }

    @Transactional
    public void updateSetupProgress(UUID tenantId, int setupStep) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));

        tenant.setSetupStep(setupStep);
        if (setupStep >= 5) { // Assuming 5 steps total
            tenant.setSetupCompleted(true);
        }

        tenantRepository.save(tenant);
    }

    @Transactional
    public void deactivateTenant(UUID tenantId) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));
        
        tenant.setIsActive(false);
        tenantRepository.save(tenant);
        
        log.info("Deactivated tenant: {}", tenantId);
    }

    @Transactional(readOnly = true)
    public Page<TenantDto> getAllTenants(Pageable pageable) {
        return tenantRepository.findAll(pageable)
                .map(this::convertToDto);
    }

    @Transactional(readOnly = true)
    public Page<TenantDto> searchTenants(String search, Pageable pageable) {
        return tenantRepository.searchTenants(search, pageable)
                .map(this::convertToDto);
    }

    @Transactional(readOnly = true)
    public List<TenantDto> getActiveTenants() {
        return tenantRepository.findActiveTenants(LocalDateTime.now())
                .stream()
                .map(this::convertToDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TenantDto> getExpiredTrialTenants() {
        return tenantRepository.findExpiredTrialTenants(LocalDateTime.now())
                .stream()
                .map(this::convertToDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public TenantStatsDto getTenantStats() {
        long totalTenants = tenantRepository.count();
        long activeTenants = tenantRepository.countActiveTenants();
        long trialTenants = tenantRepository.countActiveTrialTenants(LocalDateTime.now());

        return TenantStatsDto.builder()
                .totalTenants(totalTenants)
                .activeTenants(activeTenants)
                .trialTenants(trialTenants)
                .paidTenants(activeTenants - trialTenants)
                .build();
    }

    private boolean isValidSubdomain(String subdomain) {
        return subdomain != null && 
               subdomain.length() >= 3 && 
               subdomain.length() <= 50 && 
               SUBDOMAIN_PATTERN.matcher(subdomain).matches();
    }

    private boolean isValidDomain(String domain) {
        return domain != null && 
               domain.length() >= 4 && 
               domain.length() <= 200 && 
               DOMAIN_PATTERN.matcher(domain).matches();
    }

    private TenantDto convertToDto(Tenant tenant) {
        return TenantDto.builder()
                .id(tenant.getId())
                .name(tenant.getName())
                .subdomain(tenant.getSubdomain())
                .customDomain(tenant.getCustomDomain())
                .industry(tenant.getIndustry())
                .companySize(tenant.getCompanySize())
                .description(tenant.getDescription())
                .logoUrl(tenant.getLogoUrl())
                .primaryColor(tenant.getPrimaryColor())
                .secondaryColor(tenant.getSecondaryColor())
                .timezone(tenant.getTimezone())
                .locale(tenant.getLocale())
                .currency(tenant.getCurrency())
                .dateFormat(tenant.getDateFormat())
                .timeFormat(tenant.getTimeFormat())
                .isActive(tenant.getIsActive())
                .isTrial(tenant.getIsTrial())
                .trialEndDate(tenant.getTrialEndDate())
                .subscriptionPlan(tenant.getSubscriptionPlan())
                .maxUsers(tenant.getMaxUsers())
                .maxStorageGb(tenant.getMaxStorageGb())
                .featuresEnabled(tenant.getFeaturesEnabled())
                .billingEmail(tenant.getBillingEmail())
                .technicalContactEmail(tenant.getTechnicalContactEmail())
                .address(tenant.getAddress())
                .phone(tenant.getPhone())
                .website(tenant.getWebsite())
                .setupCompleted(tenant.getSetupCompleted())
                .setupStep(tenant.getSetupStep())
                .userCount(tenant.getUserCount())
                .storageUsedGb(tenant.getStorageUsedGb())
                .apiCallsMonthly(tenant.getApiCallsMonthly())
                .notes(tenant.getNotes())
                .createdAt(tenant.getCreatedAt())
                .updatedAt(tenant.getUpdatedAt())
                .build();
    }
}
