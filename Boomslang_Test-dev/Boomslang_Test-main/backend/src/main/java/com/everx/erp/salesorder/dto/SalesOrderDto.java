package com.everx.erp.salesorder.dto;

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
public class SalesOrderDto {
    private UUID id;
    private String soNumber;
    private UUID dealId;
    private UUID accountId;
    private String status;
    private LocalDate orderDate;
    private LocalDate expectedDelivery;
    private LocalDate actualDelivery;
    private String currency;
    private BigDecimal totalAmount;
    private String incoterms;
    private String destinationCountry;
    private String notes;
    private List<SalesOrderItemDto> items;
    private Instant createdAt;
    private Instant updatedAt;
}
