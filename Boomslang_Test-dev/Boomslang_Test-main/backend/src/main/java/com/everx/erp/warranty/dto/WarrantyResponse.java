package com.everx.erp.warranty.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WarrantyResponse {
    private UUID id;
    private String warrantyNumber;
    private UUID assetId;
    private String warrantyType;
    private LocalDate startDate;
    private LocalDate endDate;
    private String coverageDetails;
    private Boolean isActive;
}
