package com.everx.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WidgetPositionDto {
    private String widgetType;
    private String title;
    private int x;
    private int y;
    private int width;
    private int height;
    private String configJson;
}
