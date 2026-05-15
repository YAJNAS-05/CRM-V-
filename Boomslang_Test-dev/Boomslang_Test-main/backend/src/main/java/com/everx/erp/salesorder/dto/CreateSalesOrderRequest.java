package com.everx.erp.salesorder.dto;

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
public class CreateSalesOrderRequest {
    @NotBlank(message = "SO number is required")
    @Size(max = 50)
    private String soNumber;
    private UUID dealId;
    @NotNull(message = "Account ID is required")
    private UUID accountId;
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
    private String incoterms;
    @Size(max = 100)
    private String destinationCountry;
    private String notes;
    private List<CreateSalesOrderItemRequest> items;
}
