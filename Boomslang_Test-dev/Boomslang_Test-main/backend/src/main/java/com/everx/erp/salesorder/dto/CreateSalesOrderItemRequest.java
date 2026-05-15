package com.everx.erp.salesorder.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateSalesOrderItemRequest {
    private UUID equipmentId;
    @NotNull(message = "Quantity is required")
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal lineTotal;
}
