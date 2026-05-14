package com.everx.reporting.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BatchUpdateWidgetsRequest {
    private List<WidgetPositionUpdate> updates;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WidgetPositionUpdate {
        private Long widgetId;
        private Integer colIndex;
        private Integer rowIndex;
        private Integer colSpan;
        private Integer rowSpan;
        private Integer widgetOrder;
    }
}
