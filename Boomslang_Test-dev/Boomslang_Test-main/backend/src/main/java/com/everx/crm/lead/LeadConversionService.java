package com.everx.crm.lead;

import com.everx.crm.account.Account;
import com.everx.crm.account.AccountRepository;
import com.everx.crm.contact.Contact;
import com.everx.crm.contact.ContactRepository;
import com.everx.crm.deal.Deal;
import com.everx.crm.deal.DealRepository;
import com.everx.crm.deal.DealStage;
import com.everx.crm.lead.dto.LeadConvertRequest;
import com.everx.crm.lead.dto.LeadDto;
import com.everx.shared.exception.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@Transactional
@Slf4j
public class LeadConversionService {

    @Autowired
    private LeadRepository leadRepository;

    @Autowired
    private ContactRepository contactRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private DealRepository dealRepository;

    public LeadDto convertLead(UUID leadId, LeadConvertRequest request) {
        log.info("Converting lead {}", leadId);

        Lead lead = leadRepository.findById(leadId)
                .orElseThrow(() -> new EntityNotFoundException("Lead not found with id: " + leadId));

        if (Boolean.TRUE.equals(lead.getIsConverted())) {
            throw new IllegalStateException("Lead is already converted");
        }

        // 1. Create Contact from Lead
        Contact contact = Contact.builder()
                .salutation(lead.getSalutation())
                .firstName(lead.getFirstName())
                .lastName(lead.getLastName())
                .email(lead.getEmail())
                .phone(lead.getPhone())
                .mobile(lead.getMobile())
                .jobTitle(lead.getJobTitle())
                .leadSource(lead.getLeadSource())
                .mailingStreet(lead.getStreet())
                .mailingCity(lead.getCity())
                .mailingState(lead.getState())
                .mailingZip(lead.getZip())
                .mailingCountry(lead.getCountry())
                .description(lead.getDescription())
                .ownerId(lead.getOwnerId())
                .build();
        Contact savedContact = contactRepository.save(contact);
        lead.setConvertedContactId(savedContact.getId());

        // 2. Create or link Account
        if (Boolean.TRUE.equals(request.getCreateAccount())) {
            Account account = Account.builder()
                    .name(request.getAccountName() != null ? request.getAccountName() : lead.getCompany())
                    .phone(lead.getPhone())
                    .email(lead.getEmail())
                    .billingStreet(lead.getStreet())
                    .billingCity(lead.getCity())
                    .billingState(lead.getState())
                    .billingZip(lead.getZip())
                    .billingCountry(lead.getCountry())
                    .annualRevenue(lead.getAnnualRevenue())
                    .employees(lead.getEmployees())
                    .ownerId(lead.getOwnerId())
                    .build();
            Account savedAccount = accountRepository.save(account);
            lead.setConvertedAccountId(savedAccount.getId());
            savedContact.setAccountId(savedAccount.getId());
            contactRepository.save(savedContact);
        }

        // 3. Create Deal (optional)
        if (Boolean.TRUE.equals(request.getCreateDeal())) {
            Deal deal = Deal.builder()
                    .name(request.getDealName() != null ? request.getDealName() : lead.getFirstName() + " " + lead.getLastName() + " - Deal")
                    .stage(DealStage.PROSPECTING)
                    .amount(request.getDealAmount())
                    .expectedCloseDate(request.getExpectedCloseDate())
                    .leadSource(lead.getLeadSource())
                    .accountId(lead.getConvertedAccountId())
                    .primaryContactId(savedContact.getId())
                    .ownerId(lead.getOwnerId())
                    .build();
            Deal savedDeal = dealRepository.save(deal);
            lead.setConvertedDealId(savedDeal.getId());
        }

        // 4. Mark lead as converted
        lead.setIsConverted(true);
        lead.setConvertedAt(OffsetDateTime.now());
        lead.setStatus("CONVERTED");

        return LeadDto.fromEntity(leadRepository.save(lead));
    }
}
