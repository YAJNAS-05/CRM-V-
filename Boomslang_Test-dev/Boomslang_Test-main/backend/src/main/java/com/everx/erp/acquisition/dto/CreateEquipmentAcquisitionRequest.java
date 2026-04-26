package com.everx.erp.acquisition.dto;

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
public class CreateEquipmentAcquisitionRequest {

    @Size(max = 50)
    private String acquisitionNumber;

    private UUID equipmentId;
    private UUID supplierId;
    private UUID purchaseOrderId;

    @NotBlank(message = "Equipment source is required")
    @Size(max = 50)
    private String equipmentSource;

    @Size(max = 255)
    private String sellerName;

    @NotBlank(message = "Stage is required")
    @Size(max = 50)
    private String stage;

    @Size(max = 100)
    private String warehouseLocation;

    private BigDecimal refurbCost;

    @Size(max = 100)
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
}
