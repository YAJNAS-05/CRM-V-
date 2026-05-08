package com.everx.performance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DatabaseAnalysisDto {
    private Double totalConnections;
    private Double activeConnections;
    private Double queryLatency;
    private Double throughput;
    private Double indexUsage;
    private Double tableSize;
    private String databaseType;
    private Map<String, Object> detailedMetrics;
    private List<String> slowQueries;
    private List<String> missingIndexes;
    private List<String> unusedIndexes;
    private String recommendations;
}
