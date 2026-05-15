package com.everx.reporting.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * ReportDefinition represents the complete definition of a report.
 * This matches the JSONB structure stored in the database.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportDefinition {
    private String title;
    private String module;                          // CRM / ERP / FINANCE / CROSS
    private String primaryTable;                    // e.g. "everx_crm.leads"
    private List<String> joins;                     // JOIN clauses as strings
    private List<ReportColumn> columns;             // what to show
    private List<ReportFilter> filters;             // user-set filter values
    private List<FilterField> availableFilters;     // what filters can be applied
    private List<SortConfig> sorts;
    private List<GroupByConfig> groupBy;
    private List<ChartConfig> charts;               // chart definitions
    private PaginationConfig pagination;
    private boolean allowExport;
    private boolean allowSchedule;
    private String dateRangeField;                  // default date field for range filter
    private String entityField;                     // company code field for multi-entity filter
}
