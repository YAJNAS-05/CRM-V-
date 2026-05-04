package com.everx.finance.close.dto;

import com.everx.finance.close.ThreeWayMatchException;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThreeWayMatchExceptionDto {

    private UUID id;
    private UUID poId;
    private UUID invoiceId;
    private UUID receiptId;
    private String exceptionType;
    private BigDecimal varianceAmount;
    private String status;
    private LocalDate periodEnd;
    private String notes;
    private UUID resolvedBy;
    private OffsetDateTime resolvedAt;
    private OffsetDateTime createdAt;

    public static ThreeWayMatchExceptionDto fromEntity(ThreeWayMatchException exception) {
        return ThreeWayMatchExceptionDto.builder()
                .id(exception.getId())
                .poId(exception.getPoId())
                .invoiceId(exception.getInvoiceId())
                .receiptId(exception.getReceiptId())
                .exceptionType(exception.getExceptionType())
                .varianceAmount(exception.getVarianceAmount())
                .status(exception.getStatus())
                .periodEnd(exception.getPeriodEnd())
                .notes(exception.getNotes())
                .resolvedBy(exception.getResolvedBy())
                .resolvedAt(exception.getResolvedAt())
                .createdAt(exception.getCreatedAt())
                .build();
    }
}
