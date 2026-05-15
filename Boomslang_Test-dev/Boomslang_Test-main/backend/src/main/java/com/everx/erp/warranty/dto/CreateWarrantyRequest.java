package com.everx.erp.warranty.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateWarrantyRequest {
    private UUID equipmentId;
    private UUID soId;
    @NotNull(message = "Account ID is required")
    private UUID accountId;
    @NotNull(message = "Start date is required")
    private LocalDate startDate;
    @NotNull(message = "End date is required")
    private LocalDate endDate;
    @NotBlank(message = "Type is required")
    @Size(max = 50)
    private String type;
    @NotBlank(message = "Status is required")
    @Size(max = 50)
    private String status;
    private String notes;
}
