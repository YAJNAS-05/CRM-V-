package com.everx.subscription.dto;

import com.everx.subscription.entity.Subscription;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateSubscriptionRequest {

    @NotNull(message = "Tenant ID is required")
    private UUID tenantId;

    @NotNull(message = "Plan ID is required")
    private UUID planId;

    @NotNull(message = "Billing cycle is required")
    private Subscription.BillingCycle billingCycle;

    private UUID paymentMethodId;
}
