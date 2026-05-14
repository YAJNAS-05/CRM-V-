package com.everx.hr.document.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HrDocumentDto {
    private UUID id;
    private UUID employeeId;
    private String documentType;
    private String fileName;
    private String fileUrl;
    private OffsetDateTime uploadedAt;
    private Boolean isVerified;
    private String notes;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
