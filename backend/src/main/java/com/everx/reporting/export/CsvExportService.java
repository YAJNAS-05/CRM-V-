package com.everx.reporting.export;

import com.everx.reporting.dto.ReportResult;
import com.everx.reporting.model.ReportColumn;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.io.IOException;
import java.time.LocalDate;
import java.util.Map;

@Service
public class CsvExportService {

    public ExportResult export(ReportResult report, String reportName) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream();
             OutputStreamWriter writer = new OutputStreamWriter(out);
             CSVPrinter csvPrinter = new CSVPrinter(writer, CSVFormat.DEFAULT.withHeader())) {

            // Write header
            String[] headers = report.getColumns().stream()
                .map(ReportColumn::getLabel)
                .toArray(String[]::new);
            for (String header : headers) {
                csvPrinter.print(header);
            }
            csvPrinter.println();

            // Write data rows
            for (Map<String, Object> row : report.getRows()) {
                for (ReportColumn col : report.getColumns()) {
                    Object value = row.get(col.getColumnId());
                    csvPrinter.print(formatValue(value, col));
                }
                csvPrinter.println();
            }

            // Write aggregates if present
            if (report.getAggregates() != null && !report.getAggregates().isEmpty()) {
                csvPrinter.print("TOTALS");
                for (int i = 1; i < report.getColumns().size(); i++) {
                    ReportColumn col = report.getColumns().get(i);
                    Object aggVal = report.getAggregates().get(col.getColumnId());
                    csvPrinter.print(aggVal != null ? aggVal.toString() : "");
                }
                csvPrinter.println();
            }

            csvPrinter.flush();
            writer.flush();

            return ExportResult.builder()
                .data(out.toByteArray())
                .contentType("text/csv")
                .filename(sanitizeFilename(reportName) + "_" + LocalDate.now() + ".csv")
                .build();

        } catch (IOException e) {
            throw new RuntimeException("CSV export failed: " + e.getMessage());
        }
    }

    private String formatValue(Object value, ReportColumn column) {
        if (value == null) return "";

        return switch (column.getDataType()) {
            case "CURRENCY" -> String.format("%.2f", ((Number) value).doubleValue());
            case "DATE" -> value.toString();
            case "NUMBER" -> value.toString();
            case "BOOLEAN" -> (Boolean) value ? "Yes" : "No";
            default -> value.toString();
        };
    }

    private String sanitizeFilename(String name) {
        return name.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}
