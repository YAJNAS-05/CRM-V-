package com.everx.reporting.export;

import com.everx.reporting.dto.ReportResult;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExportResult {
    private byte[] data;
    private String contentType;
    private String filename;
}
