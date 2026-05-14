package com.everx.reporting.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardConfigDTO {
    private Long dashboardId;
    private String userEmail;
    private String dashboardName;
    private String dashboardKey;
    private String description;
    private Boolean isDefault;
    private Boolean isShared;
    private Integer gridColumns;
    private Integer widgetsCount;
    private String[] sharedWithEmails;
    private String[] sharedWithRoles;
    private List<DashboardWidgetDTO> widgets;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
