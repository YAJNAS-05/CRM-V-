package com.everx.crm.quote.dto;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class CreateQuoteRequest {

    @NotNull
    private UUID dealId;

    @NotBlank
    private String quoteNumber;

    @NotNull
    private Long version;

    @NotBlank
    private String status;

    @NotNull
    private LocalDate issuedDate;

    @NotNull
    private LocalDate expiryDate;

    @NotBlank
    private String currency;

    @NotNull
    private BigDecimal subtotal;

    @NotNull
    private BigDecimal taxAmount;

    @NotNull
    private BigDecimal totalAmount;

    private String notes;
    private String terms;
    private String pdfUrl;

    @NotNull
    private List<CreateQuoteLineItemRequest> lineItems;
}
