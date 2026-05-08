package com.everx.saas.service;

import com.everx.saas.entity.Subscription;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubscriptionService {

    public Map<String, Object> getSubscriptionPlans() {
        log.info("Fetching available subscription plans");
        
        List<Map<String, Object>> plans = Arrays.asList(
            Map.of(
                "id", "starter",
                "name", "Starter",
                "monthlyPrice", new BigDecimal("29.99"),
                "yearlyPrice", new BigDecimal("299.99"),
                "maxUsers", 5,
                "maxStorageGb", 10,
                "features", Arrays.asList("Basic CRM", "Email Support", "5GB Storage")
            ),
            Map.of(
                "id", "professional",
                "name", "Professional",
                "monthlyPrice", new BigDecimal("99.99"),
                "yearlyPrice", new BigDecimal("999.99"),
                "maxUsers", 25,
                "maxStorageGb", 100,
                "features", Arrays.asList("Full CRM", "Advanced Analytics", "Priority Support", "100GB Storage", "API Access")
            ),
            Map.of(
                "id", "enterprise",
                "name", "Enterprise",
                "monthlyPrice", new BigDecimal("299.99"),
                "yearlyPrice", new BigDecimal("2999.99"),
                "maxUsers", 100,
                "maxStorageGb", 1000,
                "features", Arrays.asList("Everything in Professional", "Custom Integrations", "Dedicated Support", "Unlimited Storage", "AI Features")
            )
        );
        
        return Map.of(
            "plans", plans,
            "currency", "USD",
            "billingCycle", "monthly"
        );
    }

    public Map<String, Object> getCurrentSubscription(UUID tenantId) {
        log.info("Getting current subscription for tenant: {}", tenantId);
        
        // Mock current subscription
        return Map.of(
            "id", UUID.randomUUID(),
            "tenantId", tenantId,
            "planType", "professional",
            "status", "ACTIVE",
            "monthlyPrice", new BigDecimal("99.99"),
            "maxUsers", 25,
            "currentUsers", 12,
            "maxStorageGb", 100,
            "usedStorageGb", 45,
            "nextBillingDate", LocalDateTime.now().plusMonths(1),
            "trialEnd", null,
            "features", Arrays.asList("Full CRM", "Advanced Analytics", "Priority Support", "100GB Storage", "API Access")
        );
    }

    @Transactional
    public Map<String, Object> upgradeSubscription(UUID tenantId, String planType) {
        log.info("Upgrading subscription for tenant: {} to plan: {}", tenantId, planType);
        
        Map<String, Object> newSubscription = Map.of(
            "id", UUID.randomUUID(),
            "tenantId", tenantId,
            "planType", planType,
            "status", "ACTIVE",
            "upgradedAt", LocalDateTime.now(),
            "nextBillingDate", LocalDateTime.now().plusMonths(1)
        );
        
        return Map.of(
            "success", true,
            "message", "Subscription upgraded successfully",
            "subscription", newSubscription
        );
    }

    @Transactional
    public Map<String, Object> cancelSubscription(UUID tenantId) {
        log.info("Cancelling subscription for tenant: {}", tenantId);
        
        return Map.of(
            "success", true,
            "message", "Subscription cancelled successfully",
            "cancelledAt", LocalDateTime.now(),
            "accessUntil", LocalDateTime.now().plusMonths(1)
        );
    }

    public Map<String, Object> getUsageMetrics(UUID tenantId) {
        log.info("Getting usage metrics for tenant: {}", tenantId);
        
        return Map.of(
            "users", Map.of(
                "current", 12,
                "max", 25,
                "percentage", 48.0
            ),
            "storage", Map.of(
                "current", 45,
                "max", 100,
                "percentage", 45.0
            ),
            "apiCalls", Map.of(
                "current", 45000,
                "max", 100000,
                "percentage", 45.0
            ),
            "features", Map.of(
                "crm", true,
                "analytics", true,
                "ai", true,
                "integrations", true
            )
        );
    }
}
