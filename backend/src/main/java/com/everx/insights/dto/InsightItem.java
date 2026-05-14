package com.everx.insights.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InsightItem {

    private String key;
    private String label;
    private long count;
    private String href;
    private String category;
}
