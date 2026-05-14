package com.everx.erp.logistics.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateShipmentRequest {
    private UUID soId;
    private UUID poId;
    private UUID siteAssessmentId;
    private Boolean siteReadinessConfirmed;
    @Size(max = 100)
    private String trackingNumber;
    @Size(max = 50)
    private String carrier;
    @Size(max = 100)
    private String originCountry;
    @Size(max = 100)
    private String destinationCountry;
    @NotBlank(message = "Status is required")
    @Size(max = 50)
    private String status;
    private LocalDate shippedDate;
    private LocalDate estimatedArrival;
    private LocalDate actualArrival;
    private String billOfLadingUrl;
    private String packingListUrl;
    private String customsDeclarationUrl;
    private BigDecimal freightCost;
    @Size(max = 3)
    private String currency;
    /** GOOD or DAMAGED — used when status=DELIVERED to determine final equipment state */
    @Size(max = 10)
    private String conditionOnDelivery;
}
