package com.everx.erp.purchaseorder.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderDto {
    private UUID id;
    private String poNumber;
    private UUID supplierId;
    private String status;
    private LocalDate orderDate;
    private LocalDate expectedDelivery;
    private LocalDate actualDelivery;
    private String currency;
    private BigDecimal totalAmount;
    private String paymentMethod;
    private String[] shippingDocs;
    private String notes;
    private List<PurchaseOrderItemDto> items;
    private Instant createdAt;
    private Instant updatedAt;
}
