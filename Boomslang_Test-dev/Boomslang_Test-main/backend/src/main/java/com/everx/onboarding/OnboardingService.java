package com.everx.onboarding.service;

import com.everx.auth.entity.User;
import com.everx.auth.repository.UserRepository;
import com.everx.onboarding.dto.*;
import com.everx.tenant.dto.TenantDto;
import com.everx.tenant.entity.Tenant;
import com.everx.tenant.repository.TenantRepository;
import com.everx.tenant.service.TenantService;
import com.everx.tenant.service.TenantContextService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OnboardingService {

    private final TenantService tenantService;
    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TenantContextService tenantContextService;

    @Transactional
    public OnboardingResponseDto startOnboarding(StartOnboardingRequest request) {
        log.info("Starting onboarding for company: {}", request.getCompanyName());

        // Step 1: Create tenant
        com.everx.tenant.dto.CreateTenantRequest tenantRequest = new com.everx.tenant.dto.CreateTenantRequest();
        tenantRequest.setName(request.getCompanyName());
        tenantRequest.setSubdomain(request.getSubdomain());
        tenantRequest.setIndustry(request.getIndustry());
        tenantRequest.setCompanySize(request.getCompanySize());
        tenantRequest.setBillingEmail(request.getBillingEmail());
        tenantRequest.setTechnicalContactEmail(request.getTechnicalContactEmail());

        TenantDto tenant = tenantService.createTenant(tenantRequest, null);

        // Update tenant setup progress
        tenantService.updateSetupProgress(tenant.getId(), 1);

        return OnboardingResponseDto.builder()
                .tenantId(tenant.getId())
                .subdomain(tenant.getSubdomain())
                .step(1)
                .message("Tenant created successfully")
                .nextStep("create_admin_user")
                .build();
    }

    @Transactional
    public OnboardingResponseDto createAdminUser(UUID tenantId, CreateAdminUserRequest request) {
        log.info("Creating admin user for tenant: {}", tenantId);

        // Validate tenant
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));

        // Check if admin user already exists
        boolean adminExists = userRepository.existsByEmailAndTenantId(request.getEmail(), tenantId);
        if (adminExists) {
            throw new RuntimeException("Admin user already exists for this tenant");
        }

        // Create admin user
        User adminUser = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFirstName() + " " + request.getLastName())
                .phone(request.getPhone())
                .role(User.UserRole.ADMIN)
                .tenantId(tenantId)
                .isActive(true)
                .build();

        userRepository.save(adminUser);

        // Update tenant setup progress
        tenantService.updateSetupProgress(tenantId, 2);

        return OnboardingResponseDto.builder()
                .tenantId(tenantId)
                .step(2)
                .message("Admin user created successfully")
                .nextStep("company_profile")
                .build();
    }

    @Transactional
    public OnboardingResponseDto updateCompanyProfile(UUID tenantId, UpdateCompanyProfileRequest request) {
        log.info("Updating company profile for tenant: {}", tenantId);

        com.everx.tenant.dto.UpdateTenantRequest updateRequest = new com.everx.tenant.dto.UpdateTenantRequest();
        updateRequest.setDescription(request.getDescription());
        updateRequest.setAddress(request.getAddress());
        updateRequest.setPhone(request.getPhone());
        updateRequest.setWebsite(request.getWebsite());
        updateRequest.setLogoUrl(request.getLogoUrl());
        updateRequest.setPrimaryColor(request.getPrimaryColor());
        updateRequest.setSecondaryColor(request.getSecondaryColor());
        updateRequest.setTimezone(request.getTimezone());
        updateRequest.setLocale(request.getLocale());
        updateRequest.setCurrency(request.getCurrency());

        tenantService.updateTenant(tenantId, updateRequest);

        // Update tenant setup progress
        tenantService.updateSetupProgress(tenantId, 3);

        return OnboardingResponseDto.builder()
                .tenantId(tenantId)
                .step(3)
                .message("Company profile updated successfully")
                .nextStep("import_data")
                .build();
    }

    @Transactional
    public OnboardingResponseDto importInitialData(UUID tenantId, ImportDataRequest request) {
        log.info("Importing initial data for tenant: {}", tenantId);

        // Set tenant context for data import
        tenantContextService.setCurrentTenant(tenantId);

        Map<String, Integer> importResults = new HashMap<>();

        // Import data based on selected modules
        if (request.getImportContacts() != null && request.getImportContacts()) {
            int contactsImported = importSampleContacts(tenantId);
            importResults.put("contacts", contactsImported);
        }

        if (request.getImportProducts() != null && request.getImportProducts()) {
            int productsImported = importSampleProducts(tenantId);
            importResults.put("products", productsImported);
        }

        if (request.getImportServices() != null && request.getImportServices()) {
            int servicesImported = importSampleServices(tenantId);
            importResults.put("services", servicesImported);
        }

        // Update tenant setup progress
        tenantService.updateSetupProgress(tenantId, 4);

        return OnboardingResponseDto.builder()
                .tenantId(tenantId)
                .step(4)
                .message("Initial data imported successfully")
                .nextStep("configure_settings")
                .importResults(importResults)
                .build();
    }

    @Transactional
    public OnboardingResponseDto configureSettings(UUID tenantId, ConfigureSettingsRequest request) {
        log.info("Configuring settings for tenant: {}", tenantId);

        // Update tenant with configuration settings
        com.everx.tenant.dto.UpdateTenantRequest updateRequest = new com.everx.tenant.dto.UpdateTenantRequest();
        updateRequest.setDateFormat(request.getDateFormat());
        updateRequest.setTimeFormat(request.getTimeFormat());
        updateRequest.setNotes(request.getAdditionalNotes());

        tenantService.updateTenant(tenantId, updateRequest);

        // Complete setup
        tenantService.updateSetupProgress(tenantId, 5);

        return OnboardingResponseDto.builder()
                .tenantId(tenantId)
                .step(5)
                .message("Setup completed successfully")
                .nextStep("completed")
                .build();
    }

    @Transactional(readOnly = true)
    public OnboardingStatusDto getOnboardingStatus(UUID tenantId) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));

        return OnboardingStatusDto.builder()
                .tenantId(tenantId)
                .tenantName(tenant.getName())
                .subdomain(tenant.getSubdomain())
                .currentStep(tenant.getSetupStep())
                .isCompleted(tenant.getSetupCompleted())
                .trialEndDate(tenant.getTrialEndDate())
                .subscriptionPlan(tenant.getSubscriptionPlan())
                .build();
    }

    @Transactional(readOnly = true)
    public List<OnboardingStepDto> getOnboardingSteps() {
        return List.of(
                OnboardingStepDto.builder()
                        .step(1)
                        .name("create_tenant")
                        .title("Create Your Organization")
                        .description("Set up your company information and choose your subdomain")
                        .estimatedMinutes(5)
                        .build(),
                OnboardingStepDto.builder()
                        .step(2)
                        .name("create_admin_user")
                        .title("Create Admin Account")
                        .description("Set up your administrator account to manage the system")
                        .estimatedMinutes(3)
                        .build(),
                OnboardingStepDto.builder()
                        .step(3)
                        .name("company_profile")
                        .title("Complete Company Profile")
                        .description("Add your company details, branding, and preferences")
                        .estimatedMinutes(10)
                        .build(),
                OnboardingStepDto.builder()
                        .step(4)
                        .name("import_data")
                        .title("Import Initial Data")
                        .description("Import your existing contacts, products, and services")
                        .estimatedMinutes(15)
                        .build(),
                OnboardingStepDto.builder()
                        .step(5)
                        .name("configure_settings")
                        .title("Configure Settings")
                        .description("Set up your preferences and complete the setup")
                        .estimatedMinutes(5)
                        .build()
        );
    }

    @Transactional
    public void skipOnboardingStep(UUID tenantId, int step) {
        log.info("Skipping onboarding step {} for tenant: {}", step, tenantId);
        
        // Move to next step
        tenantService.updateSetupProgress(tenantId, step + 1);
    }

    @Transactional
    public void resetOnboarding(UUID tenantId) {
        log.info("Resetting onboarding for tenant: {}", tenantId);
        
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));
        
        tenant.setSetupStep(0);
        tenant.setSetupCompleted(false);
        tenantRepository.save(tenant);
    }

    // Helper methods for sample data import
    private int importSampleContacts(UUID tenantId) {
        // This would import sample contacts for the tenant
        // Implementation would depend on your contact entity structure
        log.info("Importing sample contacts for tenant: {}", tenantId);
        return 5; // Return count of imported contacts
    }

    private int importSampleProducts(UUID tenantId) {
        // This would import sample products for the tenant
        log.info("Importing sample products for tenant: {}", tenantId);
        return 10; // Return count of imported products
    }

    private int importSampleServices(UUID tenantId) {
        // This would import sample services for the tenant
        log.info("Importing sample services for tenant: {}", tenantId);
        return 5; // Return count of imported services
    }
}
