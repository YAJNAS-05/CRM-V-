package com.everx.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDashboardLayoutDto {
    private UUID id;
    private UUID userId;
    private String dashboardType;
    private String layoutJson;
    private List<WidgetPositionDto> widgets;
    private Instant updatedAt;
    private boolean isDefault;
}
