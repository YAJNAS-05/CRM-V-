package com.everx.saas.controller;

import com.everx.saas.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/saas")
@RequiredArgsConstructor
@Slf4j
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @GetMapping("/plans")
    public ResponseEntity<Map<String, Object>> getSubscriptionPlans() {
        log.info("Fetching subscription plans");
        
        Map<String, Object> plans = subscriptionService.getSubscriptionPlans();
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Subscription plans retrieved successfully",
            "data", plans
        ));
    }

    @GetMapping("/subscription/current")
    public ResponseEntity<Map<String, Object>> getCurrentSubscription(@RequestParam UUID tenantId) {
        log.info("Getting current subscription for tenant: {}", tenantId);
        
        Map<String, Object> subscription = subscriptionService.getCurrentSubscription(tenantId);
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Current subscription retrieved successfully",
            "data", subscription
        ));
    }

    @PostMapping("/subscription/upgrade")
    public ResponseEntity<Map<String, Object>> upgradeSubscription(
            @RequestParam UUID tenantId,
            @RequestParam String planType) {
        
        log.info("Upgrading subscription for tenant: {} to plan: {}", tenantId, planType);
        
        Map<String, Object> result = subscriptionService.upgradeSubscription(tenantId, planType);
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Subscription upgraded successfully",
            "data", result
        ));
    }

    @PostMapping("/subscription/cancel")
    public ResponseEntity<Map<String, Object>> cancelSubscription(@RequestParam UUID tenantId) {
        log.info("Cancelling subscription for tenant: {}", tenantId);
        
        Map<String, Object> result = subscriptionService.cancelSubscription(tenantId);
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Subscription cancelled successfully",
            "data", result
        ));
    }

    @GetMapping("/usage")
    public ResponseEntity<Map<String, Object>> getUsageMetrics(@RequestParam UUID tenantId) {
        log.info("Getting usage metrics for tenant: {}", tenantId);
        
        Map<String, Object> usage = subscriptionService.getUsageMetrics(tenantId);
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Usage metrics retrieved successfully",
            "data", usage
        ));
    }

    @GetMapping("/billing")
    public ResponseEntity<Map<String, Object>> getBillingInfo(@RequestParam UUID tenantId) {
        log.info("Getting billing info for tenant: {}", tenantId);
        
        Map<String, Object> billing = Map.of(
            "tenantId", tenantId,
            "currentPlan", "professional",
            "monthlyPrice", 99.99,
            "nextBillingDate", java.time.LocalDateTime.now().plusMonths(1),
            "paymentMethod", "credit_card",
            "paymentStatus", "active",
            "billingHistory", Arrays.asList(
                Map.of("date", java.time.LocalDateTime.now().minusMonths(1), "amount", 99.99, "status", "paid"),
                Map.of("date", java.time.LocalDateTime.now().minusMonths(2), "amount", 99.99, "status", "paid")
            )
        );
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Billing info retrieved successfully",
            "data", billing
        ));
    }
}
