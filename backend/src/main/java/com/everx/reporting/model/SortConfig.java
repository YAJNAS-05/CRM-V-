package com.everx.reporting.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SortConfig {
    private String field;
    private String direction;                       // ASC / DESC
    private int priority;
}
