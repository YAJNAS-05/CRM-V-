package com.everx.erp.purchaseorder.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreatePurchaseOrderRequest {
    
    @NotBlank(message = "PO number is required")
    @Size(max = 50)
    private String poNumber;

    @NotNull(message = "Supplier ID is required")
    private UUID supplierId;

    @NotBlank(message = "Status is required")
    @Size(max = 50)
    private String status;

    private LocalDate orderDate;
    private LocalDate expectedDelivery;
    private LocalDate actualDelivery;

    @Size(max = 3)
    private String currency;

    private BigDecimal totalAmount;

    @Size(max = 50)
    private String paymentMethod;

    private String[] shippingDocs;
    private String notes;
    private List<CreatePurchaseOrderItemRequest> items;
}
