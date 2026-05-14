package com.everx.reporting.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FilterField {
    private String field;
    private String label;
    private String inputType;                       // DATE_RANGE/SELECT/MULTISELECT/TEXT/NUMBER_RANGE
    private String dataType;
    private boolean required;
}
