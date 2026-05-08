package com.everx.fieldwork.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateJobStatusRequest {
    
    @NotNull(message = "New status is required")
    private String newStatus;

    @Size(max = 2000, message = "Notes must not exceed 2000 characters")
    private String notes;

    private String completionNotes;

    private String workPerformed;

    private BigDecimal actualCost;

    private String cancellationReason;

    @Size(max = 100, message = "Updated by must not exceed 100 characters")
    private String updatedBy;
}
