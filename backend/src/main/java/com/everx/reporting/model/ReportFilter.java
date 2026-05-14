package com.everx.reporting.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportFilter {
    private String filterId;
    private String field;                           // table.column
    private String label;
    private String operator;                        // EQ/NEQ/GT/GTE/LT/LTE/IN/BETWEEN/CONTAINS/IS_NULL
    private Object value;
    private Object valueTo;                         // for BETWEEN
    private String inputType;                       // DATE_RANGE/SELECT/MULTISELECT/TEXT/NUMBER_RANGE
    private List<SelectOption> options;             // for SELECT / MULTISELECT
    private boolean required;
    private boolean userEditable;
}
