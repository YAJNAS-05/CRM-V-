package com.everx.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateWidgetRequest {
    private Integer positionX;
    private Integer positionY;
    private Integer width;
    private Integer height;
    private String configJson;
}
