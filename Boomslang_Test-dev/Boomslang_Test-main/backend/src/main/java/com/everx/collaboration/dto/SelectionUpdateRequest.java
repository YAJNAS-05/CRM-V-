package com.everx.collaboration.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SelectionUpdateRequest {
    private int start;
    private int end;
    private String selectedText;
    private Map<String, Object> metadata;
}
