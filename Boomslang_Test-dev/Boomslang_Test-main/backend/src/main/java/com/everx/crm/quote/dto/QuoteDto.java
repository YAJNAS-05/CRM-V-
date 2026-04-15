package com.everx.crm.quote.dto;

import com.everx.crm.quote.Quote;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuoteDto {

    private UUID id;
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
    private List<QuoteLineItemDto> lineItems;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public static QuoteDto fromEntity(Quote quote) {
        return QuoteDto.builder()
                .id(quote.getId())
                .dealId(quote.getDealId())
                .quoteNumber(quote.getQuoteNumber())
                .version(quote.getVersion())
                .status(quote.getStatus())
                .issuedDate(quote.getIssuedDate())
                .expiryDate(quote.getExpiryDate())
                .currency(quote.getCurrency())
                .subtotal(quote.getSubtotal())
                .taxAmount(quote.getTaxAmount())
                .totalAmount(quote.getTotalAmount())
                .notes(quote.getNotes())
                .terms(quote.getTerms())
                .pdfUrl(quote.getPdfUrl())
                .lineItems(quote.getLineItems() != null ? quote.getLineItems().stream().map(QuoteLineItemDto::fromEntity).collect(Collectors.toList()) : null)
                .createdAt(quote.getCreatedAt())
                .updatedAt(quote.getUpdatedAt())
                .build();
    }
}
