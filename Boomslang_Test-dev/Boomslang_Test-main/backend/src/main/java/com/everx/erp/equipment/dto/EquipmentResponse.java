package com.everx.erp.equipment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentResponse {
    private UUID id;
    private String equipmentNumber;
    private String equipmentType;
    private String description;
    private String serialNumber;
    private String status;
    private UUID locationId;
    private String locationName;
    private LocalDate purchaseDate;
    private BigDecimal purchaseCost;
}
