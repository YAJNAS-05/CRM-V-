package com.everx.erp.acquisition.dto;

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
public class EquipmentAcquisitionDto {
    private UUID id;
    private String acquisitionNumber;
    private UUID equipmentId;
    private UUID supplierId;
    private UUID purchaseOrderId;
    private String equipmentSource;
    private String sellerName;
    private String stage;
    private String warehouseLocation;
    private BigDecimal refurbCost;
    private String shipmentTracking;
    private LocalDate sourcedDate;
    private LocalDate assessedDate;
    private LocalDate poRaisedDate;
    private LocalDate deinstalledDate;
    private LocalDate arrivedWarehouseDate;
    private LocalDate refurbishedDate;
    private LocalDate qcPassedDate;
    private LocalDate availableDate;
    private String notes;
    private Instant createdAt;
    private Instant updatedAt;
}
