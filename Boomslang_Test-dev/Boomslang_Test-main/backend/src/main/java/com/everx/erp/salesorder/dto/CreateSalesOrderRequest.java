package com.everx.erp.salesorder.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateSalesOrderRequest {
    @NotNull(message = "Customer ID is required")
    private UUID customerId;
    
    private UUID contactId;
    
    @NotBlank(message = "Order date is required")
    private String orderDate;
    
    private String expectedDeliveryDate;
    
    private String status;
    
    private String priority;
    
    @NotNull(message = "Currency is required")
    private String currency;
    
    private String paymentTerms;
    
    private String shippingMethod;
    
    private String billingAddress;
    
    private String shippingAddress;
    
    private List<CreateSalesOrderItemRequest> items;
    
    private String notes;
    
    private UUID assignedTo;
}
