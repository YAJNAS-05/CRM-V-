package com.everx.shared.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComposedDashboardMetrics {
    private String scope;
    private List<String> roles;
    private List<DashboardMetricWidget> widgets;
    private LocalDateTime generatedAt;
}
