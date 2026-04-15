package com.everx.erp.warranty.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WarrantyDto {
    private UUID id;
    private UUID equipmentId;
    private UUID soId;
    private UUID accountId;
    private LocalDate startDate;
    private LocalDate endDate;
    private String type;
    private String status;
    private String notes;
    private Instant createdAt;
    private Instant updatedAt;
}
