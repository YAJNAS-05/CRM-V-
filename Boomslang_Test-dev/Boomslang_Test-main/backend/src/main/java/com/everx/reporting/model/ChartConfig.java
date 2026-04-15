package com.everx.reporting.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChartConfig {
    private String chartId;
    private String chartType;                       // BAR/LINE/PIE/DONUT/AREA/SCATTER/FUNNEL/HEATMAP
    private String title;
    private String xAxisField;
    private String yAxisField;
    private String groupByField;                    // for grouped bar/line
    private String aggregation;                     // SUM/COUNT/AVG
    private String colorScheme;
    private boolean showLegend;
    private boolean showDataLabels;
    private ChartDimensions dimensions;
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class ChartDimensions {
    private int width;
    private int height;
}
