package com.everx.erp.validation;

import com.everx.crm.account.AccountRepository;
import com.everx.crm.contact.ContactRepository;
import com.everx.crm.deal.DealRepository;
import com.everx.erp.equipment.EquipmentRepository;
import com.everx.erp.suppliers.SupplierRepository;
import com.everx.erp.salesorder.SalesOrderRepository;
import com.everx.erp.purchaseorder.PurchaseOrderRepository;
import com.everx.erp.logistics.ShipmentRepository;
import com.everx.erp.fieldwork.FieldJobRepository;
import com.everx.erp.warranty.WarrantyRepository;
import com.everx.erp.spareparts.SparePartRepository;
import com.everx.erp.subcontractors.SubcontractorRepository;
import com.everx.shared.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Utility for validating Foreign Key references across ERP modules
 * Prevents orphaned/dangling records from being created
 */
@Component
@RequiredArgsConstructor
public class ForeignKeyValidator {

    private final EquipmentRepository equipmentRepository;
    private final SupplierRepository supplierRepository;
    private final SalesOrderRepository salesOrderRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final ShipmentRepository shipmentRepository;
    private final FieldJobRepository fieldJobRepository;
    private final WarrantyRepository warrantyRepository;
    private final SparePartRepository sparePartRepository;
    private final SubcontractorRepository subcontractorRepository;
    private final AccountRepository accountRepository;
    private final ContactRepository contactRepository;
    private final DealRepository dealRepository;

    /**
     * Validates that a referenced Equipment exists
     */
    public void validateEquipmentExists(UUID equipmentId) {
        if (equipmentId == null) return;
        if (!equipmentRepository.existsById(equipmentId)) {
            throw new ValidationException("Equipment not found: " + equipmentId);
        }
    }

    /**
     * Validates that a referenced Supplier exists
     */
    public void validateSupplierExists(UUID supplierId) {
        if (supplierId == null) return;
        if (!supplierRepository.existsById(supplierId)) {
            throw new ValidationException("Supplier not found: " + supplierId);
        }
    }

    /**
     * Validates that a referenced SalesOrder exists
     */
    public void validateSalesOrderExists(UUID soId) {
        if (soId == null) return;
        if (!salesOrderRepository.existsById(soId)) {
            throw new ValidationException("Sales Order not found: " + soId);
        }
    }

    /**
     * Validates that a referenced PurchaseOrder exists
     */
    public void validatePurchaseOrderExists(UUID poId) {
        if (poId == null) return;
        if (!purchaseOrderRepository.existsById(poId)) {
            throw new ValidationException("Purchase Order not found: " + poId);
        }
    }

    /**
     * Validates that a referenced Shipment exists
     */
    public void validateShipmentExists(UUID shipmentId) {
        if (shipmentId == null) return;
        if (!shipmentRepository.existsById(shipmentId)) {
            throw new ValidationException("Shipment not found: " + shipmentId);
        }
    }

    /**
     * Validates that a referenced FieldJob exists
     */
    public void validateFieldJobExists(UUID jobId) {
        if (jobId == null) return;
        if (!fieldJobRepository.existsById(jobId)) {
            throw new ValidationException("Field job not found: " + jobId);
        }
    }

    /**
     * Validates that a referenced Warranty exists
     */
    public void validateWarrantyExists(UUID warrantyId) {
        if (warrantyId == null) return;
        if (!warrantyRepository.existsById(warrantyId)) {
            throw new ValidationException("Warranty not found: " + warrantyId);
        }
    }

    /**
     * Validates that a referenced SparePart exists
     */
    public void validateSparePartExists(UUID sparePartId) {
        if (sparePartId == null) return;
        if (!sparePartRepository.existsById(sparePartId)) {
            throw new ValidationException("Spare Part not found: " + sparePartId);
        }
    }

    /**
     * Validates that a referenced Subcontractor exists
     */
    public void validateSubcontractorExists(UUID subcontractorId) {
        if (subcontractorId == null) return;
        if (!subcontractorRepository.existsById(subcontractorId)) {
            throw new ValidationException("Subcontractor not found: " + subcontractorId);
        }
    }

    /**
     * Validates that a referenced Account (CRM) exists
     */
    public void validateAccountExists(UUID accountId) {
        if (accountId == null) return;
        if (!accountRepository.existsById(accountId)) {
            throw new ValidationException("Account not found: " + accountId);
        }
    }

    /**
     * Validates that a referenced Contact (CRM) exists
     */
    public void validateContactExists(UUID contactId) {
        if (contactId == null) return;
        if (!contactRepository.existsById(contactId)) {
            throw new ValidationException("Contact not found: " + contactId);
        }
    }

    /**
     * Validates that a referenced Deal (CRM) exists
     */
    public void validateDealExists(UUID dealId) {
        if (dealId == null) return;
        if (!dealRepository.existsById(dealId)) {
            throw new ValidationException("Deal not found: " + dealId);
        }
    }

    /**
     * Validates multiple required IDs at once
     */
    public void validateMultiple(ValidationGroup group) {
        if (group.equipmentIds != null) {
            group.equipmentIds.forEach(this::validateEquipmentExists);
        }
        if (group.supplierId != null) {
            validateSupplierExists(group.supplierId);
        }
        if (group.soId != null) {
            validateSalesOrderExists(group.soId);
        }
        if (group.poId != null) {
            validatePurchaseOrderExists(group.poId);
        }
        if (group.accountId != null) {
            validateAccountExists(group.accountId);
        }
        if (group.equipmentId != null) {
            validateEquipmentExists(group.equipmentId);
        }
    }

    /**
     * Helper class for bulk validation
     */
    public static class ValidationGroup {
        public UUID equipmentId;
        public java.util. List<UUID> equipmentIds;
        public UUID supplierId;
        public UUID soId;
        public UUID poId;
        public UUID accountId;

        public ValidationGroup withEquipmentId(UUID id) {
            this.equipmentId = id;
            return this;
        }

        public ValidationGroup withSupplierId(UUID id) {
            this.supplierId = id;
            return this;
        }

        public ValidationGroup withSalesOrderId(UUID id) {
            this.soId = id;
            return this;
        }

        public ValidationGroup withPurchaseOrderId(UUID id) {
            this.poId = id;
            return this;
        }

        public ValidationGroup withAccountId(UUID id) {
            this.accountId = id;
            return this;
        }

        public ValidationGroup withEquipmentIds(java.util.List<UUID> ids) {
            this.equipmentIds = ids;
            return this;
        }
    }
}
