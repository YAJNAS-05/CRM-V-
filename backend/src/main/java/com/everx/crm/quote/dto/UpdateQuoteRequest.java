package com.everx.crm.quote.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class UpdateQuoteRequest {

    private UUID dealId;
    private String quoteNumber;
    private Long version;
    private String status;
    private LocalDate issuedDate;
    private LocalDate expiryDate;
    private String currency;
    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
    private String notes;
    private String terms;
    private String pdfUrl;
    private List<CreateQuoteLineItemRequest> lineItems;
}
