package com.everx.tenant.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TenantStatsDto {
    private Long totalTenants;
    private Long activeTenants;
    private Long trialTenants;
    private Long paidTenants;
}
