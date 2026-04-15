package com.everx.reporting.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShareReportRequest {
    private String sharedWithEmail;
    private String sharedWithRole;
    private Boolean canEdit;
}
