package com.everx.reporting.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WidgetTemplateDTO {
    private Long templateId;
    private String templateName;
    private String widgetType;
    private Object defaultConfig;
    private String icon;
    private String category;
    private Boolean isSystem;
    private LocalDateTime createdAt;
}
