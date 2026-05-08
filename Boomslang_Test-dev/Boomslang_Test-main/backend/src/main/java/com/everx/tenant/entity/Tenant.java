package com.everx.tenant.entity;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder.Default;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tenants", schema = "everx_tenant", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"subdomain"}),
    @UniqueConstraint(columnNames = {"custom_domain"})
})
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Tenant extends BaseEntity {

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "subdomain", nullable = false, unique = true, length = 100)
    private String subdomain;

    @Column(name = "custom_domain", length = 200)
    private String customDomain;

    @Column(name = "industry", length = 100)
    private String industry;

    @Column(name = "company_size")
    private Integer companySize;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "primary_color", length = 7)
    private String primaryColor;

    @Column(name = "secondary_color", length = 7)
    private String secondaryColor;

    @Column(name = "timezone", nullable = false, length = 50)
    @Default
    private String timezone = "UTC";

    @Column(name = "locale", nullable = false, length = 10)
    @Default
    private String locale = "en_US";

    @Column(name = "currency", nullable = false, length = 3)
    @Default
    private String currency = "USD";

    @Column(name = "date_format", length = 20)
    @Default
    private String dateFormat = "MM/dd/yyyy";

    @Column(name = "time_format", length = 10)
    @Default
    private String timeFormat = "12h";

    @Column(name = "is_active", nullable = false)
    @Default
    private Boolean isActive = true;

    @Column(name = "is_trial", nullable = false)
    @Default
    private Boolean isTrial = true;

    @Column(name = "trial_end_date")
    private LocalDateTime trialEndDate;

    @Column(name = "subscription_plan", length = 50)
    private String subscriptionPlan;

    @Column(name = "max_users")
    @Default
    private Integer maxUsers = 10;

    @Column(name = "max_storage_gb")
    @Default
    private Integer maxStorageGb = 5;

    @Column(name = "features_enabled", columnDefinition = "TEXT")
    private String featuresEnabled;

    @Column(name = "billing_email", length = 200)
    private String billingEmail;

    @Column(name = "technical_contact_email", length = 200)
    private String technicalContactEmail;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @Column(name = "phone", length = 50)
    private String phone;

    @Column(name = "website", length = 200)
    private String website;

    @Column(name = "setup_completed", nullable = false)
    @Default
    private Boolean setupCompleted = false;

    @Column(name = "setup_step", nullable = false)
    @Default
    private Integer setupStep = 0;

    @Column(name = "created_by_user_id")
    private UUID createdByUserId;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @Column(name = "user_count")
    @Default
    private Integer userCount = 0;

    @Column(name = "storage_used_gb")
    @Default
    private Double storageUsedGb = 0.0;

    @Column(name = "api_calls_monthly")
    @Default
    private Integer apiCallsMonthly = 0;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    // Helper methods
    public boolean isTrialExpired() {
        return isTrial && trialEndDate != null && trialEndDate.isBefore(LocalDateTime.now());
    }

    public boolean hasFeature(String feature) {
        return featuresEnabled != null && featuresEnabled.contains(feature);
    }

    public String getFullDomain() {
        return customDomain != null ? customDomain : subdomain + ".everx.com";
    }

    public boolean canAddUser() {
        return userCount < maxUsers;
    }

    public boolean hasStorageAvailable(Double additionalGb) {
        return (storageUsedGb + additionalGb) <= maxStorageGb;
    }
}
