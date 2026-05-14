package com.everx.crm.quote.dto;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class CreateQuoteLineItemRequest {

    private UUID equipmentId;

    @NotBlank
    private String description;

    @NotNull
    private Integer quantity;

    @NotNull
    private BigDecimal unitPrice;

    private java.math.BigDecimal discountPct;

    @NotNull
    private BigDecimal totalPrice;
}
