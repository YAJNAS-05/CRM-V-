package com.everx.reporting.dto;

import com.everx.reporting.model.ReportColumn;
import com.everx.reporting.model.ChartConfig;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportResult {
    private Long reportId;
    private String reportName;
    private List<ReportColumn> columns;
    private List<Map<String, Object>> rows;
    private Long totalCount;
    private Integer page;
    private Integer pageSize;
    private Map<String, Object> aggregates;
    private List<ChartData> chartData;
    private LocalDateTime executedAt;
    private Long durationMs;
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class ChartData {
    private String chartId;
    private List<Map<String, Object>> data;
}
