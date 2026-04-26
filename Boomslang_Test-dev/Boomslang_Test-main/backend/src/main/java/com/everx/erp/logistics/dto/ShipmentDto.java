package com.everx.erp.logistics.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShipmentDto {
    private UUID id;
    private UUID soId;
    private UUID poId;
    private UUID siteAssessmentId;
    private Boolean siteReadinessConfirmed;
    private String trackingNumber;
    private String carrier;
    private String originCountry;
    private String destinationCountry;
    private String status;
    private LocalDate shippedDate;
    private LocalDate estimatedArrival;
    private LocalDate actualArrival;
    private String billOfLadingUrl;
    private String packingListUrl;
    private String customsDeclarationUrl;
    private BigDecimal freightCost;
    private String currency;
    private Instant createdAt;
    private Instant updatedAt;
}
