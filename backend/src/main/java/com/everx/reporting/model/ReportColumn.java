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
public class ReportColumn {
    private String columnId;                        // unique id
    private String label;                           // display name (user-editable)
    private String field;                           // table.column_name
    private String dataType;                        // STRING / NUMBER / DATE / CURRENCY / BOOLEAN / ENUM
    private String format;                          // e.g. "#,##0.00" / "dd-MMM-yyyy"
    private String currency;                        // if CURRENCY type, which currency field to use
    private boolean visible;                        // user can hide columns
    private boolean sortable;
    private boolean aggregatable;                   // can SUM/AVG/COUNT this column
    private String aggregation;                     // SUM / AVG / COUNT / MIN / MAX / null
    private int displayOrder;
    private int width;                              // px, user-resizable
    private String alignment;                       // LEFT / CENTER / RIGHT
    private String conditionalFormat;              // e.g. "value < 0 = RED"
}
