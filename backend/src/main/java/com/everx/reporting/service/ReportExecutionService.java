package com.everx.reporting.service;

import com.everx.reporting.dto.ReportExecutionRequest;
import com.everx.reporting.dto.ReportResult;
import com.everx.reporting.entity.ReportDefinitionEntity;
import com.everx.reporting.model.ReportColumn;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.Locale;
import java.util.stream.Collectors;

/**
 * Wrapper around DynamicReportService that provides fallback mock data
 * for template reports that may not have their underlying data sources configured
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ReportExecutionService {

    private final DynamicReportService dynamicReportService;
    private final ReportDefinitionService reportDefService;

    @Value("${everx.reporting.allow-mock-fallback:false}")
    private boolean allowMockFallback;

    public ReportResult execute(Long reportId, ReportExecutionRequest request, UserDetails user) {
        try {
            // Try to execute the report normally
            return dynamicReportService.execute(reportId, request, user);
        } catch (Exception e) {
            if (!allowMockFallback) {
                log.error("Report {} failed with real data and mock fallback is disabled", reportId, e);
                throw new IllegalArgumentException("Failed to execute report " + reportId + " with real data", e);
            }

            log.warn("Failed to execute report {} with real data, falling back to mock data: {}",
                    reportId, e.getMessage());

            try {
                // If that fails, return mock data
                return executeMockReport(reportId, request);
            } catch (Exception mockError) {
                log.error("Failed to generate mock report data", mockError);
                throw new IllegalArgumentException("Failed to execute report: " + e.getMessage());
            }
        }
    }

    private ReportResult executeMockReport(Long reportId, ReportExecutionRequest request) {
        try {
            ReportDefinitionEntity def = reportDefService.getReport(reportId);
            
            List<Map<String, Object>> mockData = generateMockData(def.getReportName());
            List<ReportColumn> columns = buildColumnsFromRows(mockData);
            Map<String, Object> aggregates = computeSimpleAggregates(mockData, columns);

            return ReportResult.builder()
                .reportId(reportId)
                .reportName(def.getReportName())
                .columns(columns)
                .rows(mockData)
                .totalCount((long) mockData.size())
                .page(request.getPage() != null ? request.getPage() : 0)
                .pageSize(request.getPageSize() != null ? request.getPageSize() : 100)
                .aggregates(aggregates)
                .chartData(Collections.emptyList())
                .executedAt(LocalDateTime.now())
                .durationMs(150L)
                .build();
        } catch (Exception e) {
            log.error("Failed to generate mock data for report", e);
            throw new IllegalArgumentException("Unable to execute report: " + e.getMessage());
        }
    }

    private List<Map<String, Object>> generateMockData(String reportName) {
        List<Map<String, Object>> data = new ArrayList<>();

        // Generate realistic mock data based on report type
        String lowerName = reportName.toLowerCase();
        
        if (lowerName.contains("inventory") || lowerName.contains("equipment")) {
            for (int i = 1; i <= 15; i++) {
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("id", i);
                row.put("name", "Equipment " + i);
                row.put("status", i % 2 == 0 ? "AVAILABLE" : "IN_USE");
                row.put("quantity", 10 + i * 5);
                row.put("location", "Warehouse " + (char)('A' + (i % 5)));
                row.put("value", 50000 + i * 10000);
                data.add(row);
            }
        } else if (lowerName.contains("pipeline")) {
            String[] stages = {
                "Prospecting", "Qualification", "Proposal", "Negotiation", "Closed Won", "Closed Lost"
            };
            for (int i = 0; i < stages.length; i++) {
                Map<String, Object> row = new LinkedHashMap<>();
                int deals = 8 + (int) (Math.random() * 20);
                long value = 120000L + (long) (Math.random() * 450000);
                row.put("stage", stages[i]);
                row.put("dealCount", deals);
                row.put("pipelineValue", value);
                row.put("weightedValue", Math.round(value * (0.25 + i * 0.12)));
                row.put("avgAgeDays", 5 + i * 4 + (int) (Math.random() * 10));
                row.put("owner", "Rep " + ((char) ('A' + (i % 4))));
                data.add(row);
            }
        } else if (lowerName.contains("sales") || lowerName.contains("revenue")) {
            String[] months = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
            for (int i = 0; i < 12; i++) {
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("month", months[i]);
                row.put("revenue", 100000 + (int) (Math.random() * 200000));
                row.put("orders", 50 + (int) (Math.random() * 150));
                row.put("growth", Math.round((Math.random() * 50 - 10) * 10.0) / 10.0);
                data.add(row);
            }
        } else if (lowerName.contains("warranty") || lowerName.contains("service")) {
            for (int i = 1; i <= 10; i++) {
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("id", i);
                row.put("equipment", "Equipment-" + i);
                row.put("type", i % 3 == 0 ? "EXTENDED" : "STANDARD");
                row.put("status", i % 2 == 0 ? "ACTIVE" : "EXPIRED");
                row.put("expiryDate", "2026-" + String.format("%02d", (i % 12) + 1) + "-15");
                row.put("cost", 5000 + i * 1000);
                data.add(row);
            }
        } else if (lowerName.contains("invoice")) {
            for (int i = 1; i <= 20; i++) {
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("invoiceNo", "INV-2026-" + String.format("%05d", i));
                row.put("amount", 10000 + i * 5000);
                row.put("date", "2026-04-" + String.format("%02d", (i % 30) + 1));
                row.put("status", i % 3 == 0 ? "PAID" : (i % 3 == 1 ? "PENDING" : "OVERDUE"));
                row.put("customer", "Customer " + i);
                data.add(row);
            }
        } else {
            // Generic report data
            for (int i = 1; i <= 20; i++) {
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("id", i);
                row.put("name", "Record " + i);
                row.put("value", i * 1000);
                row.put("status", i % 2 == 0 ? "Active" : "Inactive");
                row.put("date", "2026-04-" + String.format("%02d", (i % 30) + 1));
                data.add(row);
            }
        }

        return data;
    }

    private List<ReportColumn> buildColumnsFromRows(List<Map<String, Object>> rows) {
        if (rows == null || rows.isEmpty()) {
            return Collections.emptyList();
        }

        List<ReportColumn> columns = new ArrayList<>();
        int order = 0;
        for (String key : rows.get(0).keySet()) {
            Object sample = rows.get(0).get(key);
            String dataType = inferDataType(sample, key);
            columns.add(ReportColumn.builder()
                    .columnId(key)
                    .field(key)
                    .label(formatColumnLabel(key))
                    .dataType(dataType)
                    .visible(true)
                    .sortable(true)
                    .aggregatable("NUMBER".equals(dataType) || "CURRENCY".equals(dataType))
                    .displayOrder(order++)
                    .width("CURRENCY".equals(dataType) || "NUMBER".equals(dataType) ? 140 : 180)
                    .alignment("NUMBER".equals(dataType) || "CURRENCY".equals(dataType) ? "RIGHT" : "LEFT")
                    .build());
        }
        return columns;
    }

    private String inferDataType(Object value, String key) {
        String lowerKey = key == null ? "" : key.toLowerCase(Locale.ROOT);
        if (lowerKey.contains("revenue")
                || lowerKey.contains("value")
                || lowerKey.contains("amount")
                || lowerKey.contains("cost")
                || lowerKey.contains("price")) {
            return "CURRENCY";
        }
        if (value instanceof Number) {
            return lowerKey.contains("count") || lowerKey.contains("qty") || lowerKey.contains("orders")
                    ? "NUMBER"
                    : "NUMBER";
        }
        if (value instanceof Boolean) {
            return "BOOLEAN";
        }
        return "STRING";
    }

    private String formatColumnLabel(String key) {
        String spaced = key.replaceAll("([a-z])([A-Z])", "$1 $2").replace('_', ' ');
        String[] parts = spaced.split("\\s+");
        return Arrays.stream(parts)
                .filter(part -> !part.isBlank())
                .map(part -> part.substring(0, 1).toUpperCase() + part.substring(1).toLowerCase())
                .collect(Collectors.joining(" "));
    }

    private Map<String, Object> computeSimpleAggregates(List<Map<String, Object>> rows, List<ReportColumn> columns) {
        Map<String, Object> aggregates = new LinkedHashMap<>();
        for (ReportColumn column : columns) {
            if (!column.isAggregatable()) {
                continue;
            }
            String field = column.getField();
            double sum = rows.stream()
                    .map(row -> row.get(field))
                    .filter(Number.class::isInstance)
                    .mapToDouble(v -> ((Number) v).doubleValue())
                    .sum();
            aggregates.put(field + "_sum", Math.round(sum * 100.0) / 100.0);
        }
        aggregates.put("recordCount", rows.size());
        return aggregates;
    }
}
