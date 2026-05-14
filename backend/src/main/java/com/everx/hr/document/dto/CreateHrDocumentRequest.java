package com.everx.hr.document.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateHrDocumentRequest {

    @NotNull(message = "Employee ID is required")
    private UUID employeeId;

    @NotBlank(message = "Document type is required")
    private String documentType;

    @NotBlank(message = "File name is required")
    private String fileName;

    @NotBlank(message = "File URL is required")
    private String fileUrl;

    private String notes;
}
