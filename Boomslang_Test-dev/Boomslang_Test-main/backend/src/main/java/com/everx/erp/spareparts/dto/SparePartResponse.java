package com.everx.erp.spareparts.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SparePartResponse {
    private UUID id;
    private String partNumber;
    private String description;
    private String compatibleEquipmentType;
    private BigDecimal unitPrice;
    private Integer quantityInStock;
}
