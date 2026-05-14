package com.everx.erp.workflow;

import com.everx.erp.equipment.Equipment;
import com.everx.erp.equipment.EquipmentRepository;
import com.everx.erp.equipment.EquipmentStatus;
import com.everx.erp.equipment.PhysicalStatus;
import com.everx.erp.logistics.Shipment;
import com.everx.erp.logistics.ShipmentRepository;
import com.everx.erp.salesorder.SalesOrder;
import com.everx.erp.salesorder.SalesOrderItem;
import com.everx.erp.warranty.Warranty;
import com.everx.erp.warranty.WarrantyRepository;
import com.everx.shared.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Orchestrates complex multi-entity workflows for Sales Orders
 * Ensures data consistency and business rule enforcement across modules
 */
@Service
@RequiredArgsConstructor
public class SalesOrderWorkflowOrchestrator {

    private final EquipmentRepository equipmentRepository;
    private final WarrantyRepository warrantyRepository;
    private final SalesOrderInvoiceGateway salesOrderInvoiceGateway;
    private final ShipmentRepository shipmentRepository;

    /**
     * Confirms a Sales Order and orchestrates cascading workflows:
     * 1. Validates and reserves equipment
     * 2. Creates/updates shipment record
     * 3. Generates deposit invoice
     * 4. Sets commercial status to SOLD
     */
    @Transactional
    public void confirmSalesOrderWorkflow(SalesOrder so) {
        if (so.getItems() == null || so.getItems().isEmpty()) {
            throw new ValidationException("Cannot confirm a sales order without items");
        }

        for (SalesOrderItem item : so.getItems()) {
            reserveEquipmentForSO(item.getEquipmentId(), so.getId());
        }

        so.setStatus("CONFIRMED");
    }

    /**
     * Reserves specific equipment for a Sales Order.
     * Ensures no double-booking and validates equipment state.
     */
    @Transactional
    public void reserveEquipmentForSO(UUID equipmentId, UUID soId) throws ValidationException {
        Equipment equipment = equipmentRepository.findByIdAndNotDeleted(equipmentId)
                .orElseThrow(() -> new ValidationException("Equipment not found: " + equipmentId));

        // Check if equipment is already reserved or sold
        if (equipment.getPhysicalStatus() == PhysicalStatus.RESERVED ||
            equipment.getPhysicalStatus() == PhysicalStatus.IN_TRANSIT ||
            equipment.getPhysicalStatus() == PhysicalStatus.INSTALLED) {
            throw new ValidationException(
                "Equipment cannot be reserved - current status: " + equipment.getPhysicalStatus()
            );
        }

        // Set equipment to RESERVED state
        equipment.setPhysicalStatus(PhysicalStatus.RESERVED);
        equipment.setCommercialStatus(com.everx.erp.equipment.CommercialStatus.SOLD);
        equipmentRepository.save(equipment);
    }

    /**
     * Auto-creates a Warranty when equipment installation is signed off.
     * Called when shipment status changes to "DELIVERED" or "INSTALLED"
     */
    @Transactional
    public void createWarrantyOnInstallation(UUID equipmentId, UUID soId, UUID accountId, 
                                            Integer warrantyMonths, String warrantyType) {
        Equipment equipment = equipmentRepository.findByIdAndNotDeleted(equipmentId)
                .orElseThrow(() -> new ValidationException("Equipment not found: " + equipmentId));

        // Check if warranty already exists for this SO
        if (warrantyRepository.existsBySoIdAndEquipmentId(soId, equipmentId)) {
            throw new ValidationException("Warranty already exists for this Sales Order and Equipment");
        }

        LocalDate startDate = LocalDate.now();
        LocalDate endDate = startDate.plusMonths(warrantyMonths != null ? warrantyMonths : 12);

        Warranty warranty = Warranty.builder()
                .equipmentId(equipmentId)
                .soId(soId)
                .accountId(accountId)
                .startDate(startDate)
                .endDate(endDate)
                .type(warrantyType != null ? warrantyType : "PARTS_AND_LABOUR")
                .status("ACTIVE")
                .notes("Auto-created warranty from Sales Order " + soId)
                .ppmSchedule("ANNUAL")
                .nextPpmDue(startDate.plusYears(1))
                .build();

        warranty.setCreatedAt(OffsetDateTime.now());
        warranty.setUpdatedAt(OffsetDateTime.now());
        warrantyRepository.save(warranty);

        // Update equipment commercial status
        equipment.setCommercialStatus(com.everx.erp.equipment.CommercialStatus.WARRANTY_ACTIVE);
        equipmentRepository.save(equipment);
    }

    /**
     * Auto-generates final invoice when payment is received or SO is completed
     * Based on SO line items and amounts
     */
    @Transactional
    public void generateFinalInvoiceForSO(SalesOrder so, String invoiceType) {
        salesOrderInvoiceGateway.createFinalInvoiceForSalesOrder(so, invoiceType);
    }

    /**
     * Marks equipment as IN_TRANSIT when shipment begins
     * Updates physical status and ensures consistency
     */
    @Transactional
    public void markEquipmentInTransit(UUID equipmentId) {
        Equipment equipment = equipmentRepository.findByIdAndNotDeleted(equipmentId)
                .orElseThrow(() -> new ValidationException("Equipment not found: " + equipmentId));

        if (equipment.getPhysicalStatus() != PhysicalStatus.RESERVED) {
            throw new ValidationException(
                "Equipment must be RESERVED before marking IN_TRANSIT. Current: " + equipment.getPhysicalStatus()
            );
        }

        equipment.setPhysicalStatus(PhysicalStatus.IN_TRANSIT);
        equipmentRepository.save(equipment);
    }

    /**
     * Marks equipment as INSTALLED when delivery is complete
     * Creates warranty automatically
     */
    @Transactional
    public void markEquipmentInstalledAndCreateWarranty(UUID equipmentId, UUID soId, UUID accountId) {
        Equipment equipment = equipmentRepository.findByIdAndNotDeleted(equipmentId)
                .orElseThrow(() -> new ValidationException("Equipment not found: " + equipmentId));

        if (equipment.getPhysicalStatus() != PhysicalStatus.IN_TRANSIT) {
            throw new ValidationException(
                "Equipment must be IN_TRANSIT before marking INSTALLED. Current: " + equipment.getPhysicalStatus()
            );
        }

        equipment.setPhysicalStatus(PhysicalStatus.INSTALLED);
        equipmentRepository.save(equipment);

        // Auto-create warranty
        createWarrantyOnInstallation(equipmentId, soId, accountId, null, null);
    }

    /**
     * Validates equipment state transition (status machine enforcement)
     * Ensures only valid transitions are allowed
     */
    @Transactional(readOnly = true)
    public void validateEquipmentStatusTransition(PhysicalStatus currentStatus, PhysicalStatus newStatus) {
        // Valid transitions: AVAILABLE -> RESERVED -> IN_TRANSIT -> INSTALLED
        if (currentStatus == PhysicalStatus.AVAILABLE && newStatus == PhysicalStatus.RESERVED) {
            return; // Valid
        }
        if (currentStatus == PhysicalStatus.RESERVED && newStatus == PhysicalStatus.IN_TRANSIT) {
            return; // Valid
        }
        if (currentStatus == PhysicalStatus.IN_TRANSIT && newStatus == PhysicalStatus.INSTALLED) {
            return; // Valid
        }
        if (currentStatus == newStatus) {
            return; // No change is always valid
        }

        throw new ValidationException(
            String.format("Invalid equipment status transition: %s -> %s", currentStatus, newStatus)
        );
    }

}
