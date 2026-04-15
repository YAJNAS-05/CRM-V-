package com.everx.reporting.export;

import com.everx.reporting.dto.ReportResult;
import com.everx.reporting.model.ReportColumn;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

@Service
public class ExcelExportService {

    public ExportResult export(ReportResult report, String reportName) {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet(sanitizeSheetName(reportName));

            // Styles
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle currencyStyle = createCurrencyStyle(workbook);
            CellStyle dateStyle = createDateStyle(workbook);
            CellStyle numberStyle = createNumberStyle(workbook);

            // Header row
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < report.getColumns().size(); i++) {
                ReportColumn col = report.getColumns().get(i);
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(col.getLabel());
                cell.setCellStyle(headerStyle);
                sheet.setColumnWidth(i, Math.max(col.getWidth() * 36, 3000));
            }

            // Data rows
            int rowNum = 1;
            for (Map<String, Object> row : report.getRows()) {
                Row dataRow = sheet.createRow(rowNum++);
                writeDataRow(dataRow, row, report.getColumns(), 
                           currencyStyle, dateStyle, numberStyle);
            }

            // Aggregates row
            if (report.getAggregates() != null && !report.getAggregates().isEmpty()) {
                Row aggRow = sheet.createRow(rowNum + 1);
                Cell labelCell = aggRow.createCell(0);
                labelCell.setCellValue("TOTALS");
                labelCell.setCellStyle(headerStyle);
                for (int i = 0; i < report.getColumns().size(); i++) {
                    ReportColumn col = report.getColumns().get(i);
                    if (report.getAggregates().containsKey(col.getColumnId())) {
                        Cell cell = aggRow.createCell(i);
                        Object aggVal = report.getAggregates().get(col.getColumnId());
                        if (aggVal instanceof Number n) {
                            cell.setCellValue(n.doubleValue());
                            cell.setCellStyle(currencyStyle);
                        }
                    }
                }
            }

            sheet.createFreezePane(0, 1);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);

            return ExportResult.builder()
                .data(out.toByteArray())
                .contentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                .filename(sanitizeFilename(reportName) + "_" + LocalDate.now() + ".xlsx")
                .build();

        } catch (IOException e) {
            throw new RuntimeException("Excel export failed: " + e.getMessage());
        }
    }

    private void writeDataRow(Row dataRow, Map<String, Object> row, 
                             java.util.List<ReportColumn> columns,
                             CellStyle currencyStyle, CellStyle dateStyle, CellStyle numberStyle) {
        for (int i = 0; i < columns.size(); i++) {
            ReportColumn col = columns.get(i);
            Cell cell = dataRow.createCell(i);
            Object value = row.get(col.getColumnId());

            if (value == null) {
                cell.setBlank();
            } else if (value instanceof BigDecimal || value instanceof Double) {
                cell.setCellValue(((Number) value).doubleValue());
                cell.setCellStyle("CURRENCY".equals(col.getDataType()) 
                    ? currencyStyle : numberStyle);
            } else if (value instanceof LocalDate ld) {
                cell.setCellValue(ld);
                cell.setCellStyle(dateStyle);
            } else if (value instanceof Number n) {
                cell.setCellValue(n.doubleValue());
            } else if (value instanceof Boolean b) {
                cell.setCellValue(b);
            } else {
                cell.setCellValue(value.toString());
            }
        }
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 11);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderBottom(BorderStyle.THIN);
        return style;
    }

    private CellStyle createCurrencyStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        DataFormat format = workbook.createDataFormat();
        style.setDataFormat(format.getFormat("#,##0.00"));
        return style;
    }

    private CellStyle createDateStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        DataFormat format = workbook.createDataFormat();
        style.setDataFormat(format.getFormat("dd-mmm-yyyy"));
        return style;
    }

    private CellStyle createNumberStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        DataFormat format = workbook.createDataFormat();
        style.setDataFormat(format.getFormat("#,##0"));
        return style;
    }

    private String sanitizeFilename(String name) {
        return name.replaceAll("[^a-zA-Z0-9._-]", "_");
    }

    private String sanitizeSheetName(String name) {
        String sanitized = name.replaceAll("[^a-zA-Z0-9 ]", "_");
        return sanitized.length() > 31 ? sanitized.substring(0, 31) : sanitized;
    }
}
