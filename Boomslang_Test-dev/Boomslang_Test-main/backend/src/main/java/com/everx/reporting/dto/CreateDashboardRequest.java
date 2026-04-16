package com.everx.reporting.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateDashboardRequest {
    private String dashboardName;
    private String description;
    private Boolean isDefault;
    private Boolean isShared;
    private Integer gridColumns;
    private String[] sharedWithEmails;
    private String[] sharedWithRoles;
}
