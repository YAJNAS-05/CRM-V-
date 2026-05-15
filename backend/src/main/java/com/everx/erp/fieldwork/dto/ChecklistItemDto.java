package com.everx.erp.fieldwork.dto;

import com.everx.erp.fieldwork.ChecklistResult;
import lombok.Data;

@Data
public class ChecklistItemDto {
    private Long itemInstanceId;
    private Long checklistId;
    private Long templateItemId;
    private String sectionName;
    private String itemText;
    private ChecklistResult result;
    private String engineerNote;
    private Boolean photoAttached;
    private byte[] photo;
}