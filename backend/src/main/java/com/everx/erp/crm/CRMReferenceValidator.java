package com.everx.erp.crm;

import com.everx.crm.account.AccountRepository;
import com.everx.crm.contact.ContactRepository;
import com.everx.crm.deal.DealRepository;
import com.everx.shared.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Validates references to CRM entities from ERP workflows.
 */
@Component
@RequiredArgsConstructor
public class CRMReferenceValidator {

    private final AccountRepository accountRepository;
    private final ContactRepository contactRepository;
    private final DealRepository dealRepository;

    public void validateAccountExists(UUID accountId) {
        if (accountId == null) return;
        if (!accountRepository.existsById(accountId)) {
            throw new ValidationException("Account not found: " + accountId);
        }
    }

    public void validateContactExists(UUID contactId) {
        if (contactId == null) return;
        if (!contactRepository.existsById(contactId)) {
            throw new ValidationException("Contact not found: " + contactId);
        }
    }

    public void validateDealExists(UUID dealId) {
        if (dealId == null) return;
        if (!dealRepository.existsById(dealId)) {
            throw new ValidationException("Deal not found: " + dealId);
        }
    }
}
