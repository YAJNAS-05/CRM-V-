package com.everx.reporting.export;

import com.everx.reporting.dto.ReportResult;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ExportService {

    private final CsvExportService csvService;
    private final ExcelExportService excelService;

    public ExportResult export(ReportResult report, ExportFormat format, String reportName) {
        return switch (format) {
            case CSV -> csvService.export(report, reportName);
            case EXCEL -> excelService.export(report, reportName);
            case PDF -> throw new UnsupportedOperationException("PDF export not yet implemented");
        };
    }
}
