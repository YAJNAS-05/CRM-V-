package com.everx.erp.logistics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShipmentResponse {
    private UUID id;
    private String shipmentNumber;
    private UUID orderId;
    private String carrier;
    private String trackingNumber;
    private String status;
    private LocalDate shipDate;
    private LocalDate deliveryDate;
}
