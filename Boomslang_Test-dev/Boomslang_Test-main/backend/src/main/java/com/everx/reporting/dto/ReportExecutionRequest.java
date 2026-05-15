package com.everx.reporting.dto;

import com.everx.reporting.model.ReportFilter;
import com.everx.reporting.model.SortConfig;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportExecutionRequest {
    private List<ReportFilter> filters;
    private List<SortConfig> sorts;
    private Integer page;
    private Integer pageSize;
    private LocalDate dateFrom;
    private LocalDate dateTo;
    private String companyCode;
}
