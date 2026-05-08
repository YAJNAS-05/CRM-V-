package com.everx.subscription.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SubscriptionStatsDto {
    private Long totalSubscriptions;
    private Long activeSubscriptions;
    private Long trialSubscriptions;
    private Long cancelledSubscriptions;
}
