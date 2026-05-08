package com.everx.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WidgetTemplateDto {
    private String widgetType;
    private String title;
    private String description;
    private String dataSource;
    private int refreshInterval; // seconds
    private int defaultWidth;
    private int defaultHeight;
    private List<String> supportedRoles;
}
