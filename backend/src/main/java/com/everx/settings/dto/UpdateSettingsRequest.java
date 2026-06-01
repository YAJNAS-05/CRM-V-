package com.everx.settings.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateSettingsRequest {

    private String theme;
    private String language;
    private String timezone;
    private Boolean notificationsEnabled;
    private Boolean emailNotifications;
    private Boolean inAppNotifications;
    private Boolean autoRefresh;
    private Integer itemsPerPage;
}