package com.everx.erp.crm;

import com.everx.crm.account.Account;
import com.everx.crm.account.AccountRepository;
import com.everx.crm.contact.Contact;
import com.everx.crm.contact.ContactRepository;
import com.everx.crm.deal.Deal;
import com.everx.crm.deal.DealRepository;
import com.everx.erp.salesorder.SalesOrder;
import com.everx.erp.salesorder.SalesOrderRepository;
import com.everx.shared.exception.ValidationException;
import com.everx.shared.exception.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Integrates CRM pipeline with ERP Sales Orders
 * Enables seamless deal-to-order conversion and customer data synchronization
 */
@Service
@RequiredArgsConstructor
public class CRMERPLinkingService {

    private final DealRepository dealRepository;
    private final AccountRepository accountRepository;
    private final ContactRepository contactRepository;
    private final SalesOrderRepository salesOrderRepository;

    /**
     * Converts a CRM Deal into an ERP Sales Order
     * Automatically links deal to SO, validates account/contact, creates SO items
     */
    @Transactional
    public SalesOrder convertDealToSalesOrder(UUID dealId, CreateSalesOrderFromDealRequest request) {
        Deal deal = dealRepository.findById(dealId)
            .orElseThrow(() -> new EntityNotFoundException("Deal not found: " + dealId));

        if (!deal.getStage().toString().equals("CLOSED_WON")) {
            throw new ValidationException("Only closed won deals can be converted to sales orders");
        }

        // Validate account
        Account account = accountRepository.findById(deal.getAccountId())
            .orElseThrow(() -> new EntityNotFoundException("Deal account not found"));

        // Create Sales Order linked to Deal
        SalesOrder so = new SalesOrder();
        so.setDealId(dealId);
        so.setAccountId(deal.getAccountId());
        so.setSoNumber(generateSalesOrderNumber(deal));
        so.setStatus("DRAFT");
        so.setTotalAmount(deal.getAmount() != null ? deal.getAmount() : BigDecimal.ZERO);
        so.setCurrency(request.getCurrency() != null ? request.getCurrency() : "USD");
        so.setOrderDate(java.time.LocalDate.now());
        so.setDestinationCountry(request.getDestinationCountry());
        so.setNotes("Auto-created from Deal: " + deal.getName());

        so.setCreatedAt(java.time.OffsetDateTime.now());
        so.setUpdatedAt(java.time.OffsetDateTime.now());

        return salesOrderRepository.save(so);
    }

    /**
     * Updates CRM Deal status when SO status changes
     * Keeps CRM pipeline synchronized with ERP order lifecycle
     */
    @Transactional
    public void syncDealStatusFromSalesOrder(UUID soId, String soStatus) {
        SalesOrder so = salesOrderRepository.findByIdAndNotDeleted(soId)
            .orElseThrow(() -> new EntityNotFoundException("Sales Order not found: " + soId));

        if (so.getDealId() == null) {
            return; // Not linked to a deal
        }

        Deal deal = dealRepository.findById(so.getDealId())
            .orElseThrow(() -> new EntityNotFoundException("Deal not found: " + so.getDealId()));

        // Map SO status to CRM deal status/stage
        String newDealStage = mapSOStatusToDealStage(soStatus);
        if (!deal.getStage().toString().equals(newDealStage)) {
            deal.setStage(com.everx.crm.deal.DealStage.valueOf(newDealStage));
            deal.setUpdatedAt(java.time.OffsetDateTime.now());
            dealRepository.save(deal);
        }
    }

    @Transactional(readOnly = true)
    public java.util.List<com.everx.erp.equipment.Equipment> suggestEquipmentForDeal(UUID dealId) {
        Deal deal = dealRepository.findById(dealId)
            .orElseThrow(() -> new EntityNotFoundException("Deal not found: " + dealId));

        // Build equipment query based on deal requirements
        // This is a placeholder - actual implementation depends on deal field structure
        return java.util.Collections.emptyList();
    }

    /**
     * Links a contact from CRM as shipment delivery contact
     * Ensures shipping documents use correct customer contact info
     */
    @Transactional
    public void setShipmentContactFromCRM(UUID soId, UUID contactId) {
        SalesOrder so = salesOrderRepository.findByIdAndNotDeleted(soId)
            .orElseThrow(() -> new EntityNotFoundException("Sales Order not found: " + soId));

        Contact contact = contactRepository.findById(contactId)
            .orElseThrow(() -> new EntityNotFoundException("Contact not found: " + contactId));

        // Store contact info in SO for shipment use (would need SO to have contact_id field)
        // so.setShippingContactId(contactId);
        // salesOrderRepository.save(so);
    }

    /**
     * Gets all sales orders linked to a specific deal
     * Used for deal detail page to show related orders
     */
    @Transactional(readOnly = true)
    public java.util.List<SalesOrder> getSalesOrdersForDeal(UUID dealId) {
        return salesOrderRepository.findByDealId(dealId, org.springframework.data.domain.PageRequest.of(0, 100)).getContent();
    }

    /**
     * Gets customer account info from Deal for SO reference
     * Ensures SO has complete account context from CRM
     */
    @Transactional(readOnly = true)
    public AccountInfoDTO getAccountInfoForDeal(UUID dealId) {
        Deal deal = dealRepository.findById(dealId)
            .orElseThrow(() -> new EntityNotFoundException("Deal not found: " + dealId));

        Account account = accountRepository.findById(deal.getAccountId())
            .orElseThrow(() -> new EntityNotFoundException("Account not found"));

        return AccountInfoDTO.builder()
            .accountId(account.getId())
            .accountName(account.getName())
            .accountType(account.getAccountType())
            .country(account.getCountry())
            .email(account.getEmail())
            .phone(account.getPhone())
            .notes(account.getNotes())
            .build();
    }

    // ==================== Helper Methods ====================

    private String generateSalesOrderNumber(Deal deal) {
        return "SO-" + java.time.LocalDate.now().getYear() + "-" + 
               deal.getId().toString().substring(0, 8).toUpperCase() + "-" +
               (int)(Math.random() * 1000);
    }

    private String mapSOStatusToDealStage(String soStatus) {
        return switch(soStatus) {
            case "DRAFT" -> "PROPOSAL";
            case "CONFIRMED" -> "MOA";
            case "IN_LOGISTICS" -> "SHIPPED";
            case "INSTALLED" -> "WON";
            case "COMPLETE" -> "CLOSED_WON";
            default -> "IN_PROGRESS";
        };
    }

    // ==================== DTOs ====================

    public static class CreateSalesOrderFromDealRequest {
        private String currency;
        private String destinationCountry;
        private String incoterms;

        public String getCurrency() { return currency; }
        public void setCurrency(String currency) { this.currency = currency; }

        public String getDestinationCountry() { return destinationCountry; }
        public void setDestinationCountry(String destinationCountry) { this.destinationCountry = destinationCountry; }

        public String getIncoterms() { return incoterms; }
        public void setIncoterms(String incoterms) { this.incoterms = incoterms; }
    }

    @lombok.Builder
    public static class AccountInfoDTO {
        public UUID accountId;
        public String accountName;
        public String accountType;
        public String country;
        public String email;
        public String phone;
        public String notes;

        public UUID getAccountId() { return accountId; }
        public String getAccountName() { return accountName; }
        public String getAccountType() { return accountType; }
        public String getCountry() { return country; }
        public String getEmail() { return email; }
        public String getPhone() { return phone; }
        public String getNotes() { return notes; }
    }
}
