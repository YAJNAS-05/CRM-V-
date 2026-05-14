package com.everx.erp.acquisition;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "equipment_acquisitions", schema = "everx_erp")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentAcquisition extends BaseEntity {

    @Column(name = "acquisition_number", nullable = false, unique = true, length = 50)
    private String acquisitionNumber;

    @Column(name = "equipment_id")
    private UUID equipmentId;

    @Column(name = "supplier_id")
    private UUID supplierId;

    @Column(name = "purchase_order_id")
    private UUID purchaseOrderId;

    @Column(name = "equipment_source", nullable = false, length = 50)
    private String equipmentSource;

    @Column(name = "seller_name", length = 255)
    private String sellerName;

    @Column(nullable = false, length = 50)
    private String stage = "SOURCED";

    @Column(name = "warehouse_location", length = 100)
    private String warehouseLocation;

    @Column(name = "refurb_cost", precision = 15, scale = 2)
    private BigDecimal refurbCost;

    @Column(name = "shipment_tracking", length = 100)
    private String shipmentTracking;

    @Column(name = "sourced_date")
    private LocalDate sourcedDate;

    @Column(name = "assessed_date")
    private LocalDate assessedDate;

    @Column(name = "po_raised_date")
    private LocalDate poRaisedDate;

    @Column(name = "deinstalled_date")
    private LocalDate deinstalledDate;

    @Column(name = "arrived_warehouse_date")
    private LocalDate arrivedWarehouseDate;

    @Column(name = "refurbished_date")
    private LocalDate refurbishedDate;

    @Column(name = "qc_passed_date")
    private LocalDate qcPassedDate;

    @Column(name = "available_date")
    private LocalDate availableDate;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
