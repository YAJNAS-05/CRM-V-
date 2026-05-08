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
public class CreateEquipmentRequest {
    private String equipmentType;
    private String description;
    private String serialNumber;
    private UUID locationId;
    private LocalDate purchaseDate;
    private BigDecimal purchaseCost;
}
