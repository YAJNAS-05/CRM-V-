package com.everx.erp.fieldwork.dto;

import com.everx.erp.fieldwork.ChecklistResult;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
public class FieldJobChecklistDto {
    private Long checklistId;
    private UUID fieldJobId;
    private Long generatedFromTemplate;
    private ChecklistResult overallResult;
    private String completedBy;
    private OffsetDateTime completedAt;
    private List<ChecklistItemDto> items = new ArrayList<>();
}