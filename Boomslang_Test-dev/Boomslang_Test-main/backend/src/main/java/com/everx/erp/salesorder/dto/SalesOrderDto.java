package com.everx.erp.salesorder.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesOrderDto {
    private UUID id;
    private String orderNumber;
    private UUID customerId;
    private String customerName;
    private UUID contactId;
    private String contactName;
    private LocalDateTime orderDate;
    private LocalDateTime expectedDeliveryDate;
    private String status;
    private String priority;
    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;
    private String currency;
    private String paymentTerms;
    private String shippingMethod;
    private String billingAddress;
    private String shippingAddress;
    private List<SalesOrderItemDto> items;
    private String notes;
    private UUID assignedTo;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UUID createdBy;
    private UUID updatedBy;
}
