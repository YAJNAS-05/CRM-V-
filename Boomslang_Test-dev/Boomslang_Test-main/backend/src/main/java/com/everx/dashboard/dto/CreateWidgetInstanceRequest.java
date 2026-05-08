package com.everx.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateWidgetInstanceRequest {
    private UUID userId;
    private String widgetType;
    private String title;
    private int positionX;
    private int positionY;
    private int width;
    private int height;
    private String configJson;
    private String dashboardType;
}
