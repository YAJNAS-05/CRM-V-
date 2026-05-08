package com.everx.subscription.entity;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "subscription_plans", schema = "everx_subscription")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true, exclude = {"features", "subscriptions"})
public class SubscriptionPlan extends BaseEntity {

    @Column(name = "name", nullable = false, unique = true, length = 100)
    private String name;

    @Column(name = "display_name", nullable = false, length = 200)
    private String displayName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "price_monthly", nullable = false, precision = 10, scale = 2)
    private BigDecimal priceMonthly;

    @Column(name = "price_yearly", nullable = false, precision = 10, scale = 2)
    private BigDecimal priceYearly;

    @Column(name = "currency", nullable = false, length = 3)
    private String currency;

    @Column(name = "max_users", nullable = false)
    private Integer maxUsers;

    @Column(name = "max_storage_gb", nullable = false)
    private Integer maxStorageGb;

    @Column(name = "max_api_calls_monthly", nullable = false)
    private Integer maxApiCallsMonthly;

    @Column(name = "trial_days", nullable = false)
    private Integer trialDays;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "is_public", nullable = false)
    @Builder.Default
    private Boolean isPublic = true;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;

    @Column(name = "features_list", columnDefinition = "TEXT")
    private String featuresList; // JSON array of features

    @Column(name = "limitations", columnDefinition = "TEXT")
    private String limitations; // JSON object of limitations

    @Column(name = "billing_cycle", length = 20)
    @Builder.Default
    private String billingCycle = "MONTHLY"; // MONTHLY, YEARLY

    @Column(name = "setup_fee", precision = 10, scale = 2)
    private BigDecimal setupFee;

    @Column(name = "is_popular", nullable = false)
    @Builder.Default
    private Boolean isPopular = false;

    @Column(name = "is_enterprise", nullable = false)
    @Builder.Default
    private Boolean isEnterprise = false;

    @ManyToMany
    @JoinTable(
        name = "plan_features",
        schema = "everx_subscription",
        joinColumns = @JoinColumn(name = "plan_id"),
        inverseJoinColumns = @JoinColumn(name = "feature_id")
    )
    @Builder.Default
    private List<SubscriptionFeature> features = List.of();

    @OneToMany(mappedBy = "subscriptionPlan", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Subscription> subscriptions = List.of();

    // Helper methods
    public BigDecimal getYearlyDiscount() {
        if (priceYearly != null && priceMonthly != null) {
            BigDecimal yearlyMonthly = priceYearly.divide(BigDecimal.valueOf(12), 2, BigDecimal.ROUND_HALF_UP);
            BigDecimal discount = priceMonthly.subtract(yearlyMonthly);
            return discount.divide(priceMonthly, 4, BigDecimal.ROUND_HALF_UP).multiply(BigDecimal.valueOf(100));
        }
        return BigDecimal.ZERO;
    }

    public boolean hasFeature(String featureKey) {
        return features.stream()
                .anyMatch(f -> f.getFeatureKey().equals(featureKey) && f.getIsActive());
    }

    public boolean isWithinLimits(String metric, Integer value) {
        // This would check against the limitations JSON
        // Implementation depends on your limitation structure
        return true;
    }

    public String getBillingCycleDisplay() {
        return billingCycle.equals("YEARLY") ? "Yearly" : "Monthly";
    }

    public BigDecimal getSetupFeeDisplay() {
        return setupFee != null ? setupFee : BigDecimal.ZERO;
    }
}
