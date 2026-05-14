package com.everx.crm.quote.dto;

import com.everx.crm.quote.QuoteLineItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuoteLineItemDto {

    private UUID id;
    private UUID equipmentId;
    private String description;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal discountPct;
    private BigDecimal lineTotal;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public static QuoteLineItemDto fromEntity(QuoteLineItem item) {
        return QuoteLineItemDto.builder()
                .id(item.getId())
                .equipmentId(item.getEquipmentId())
                .description(item.getDescription())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .discountPct(item.getDiscountPct())
                .lineTotal(item.getLineTotal())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }
}
