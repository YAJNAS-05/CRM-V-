package com.everx.crm.lead;

import com.everx.crm.account.Account;
import com.everx.crm.account.AccountRepository;
import com.everx.crm.account.dto.AccountDto;
import com.everx.crm.contact.Contact;
import com.everx.crm.contact.ContactRepository;
import com.everx.crm.contact.dto.ContactDto;
import com.everx.crm.deal.Deal;
import com.everx.crm.deal.DealRepository;
import com.everx.crm.deal.dto.DealDto;
import com.everx.platform.config.service.OptionSetService;
import com.everx.crm.lead.dto.LeadConvertRequest;
import com.everx.crm.lead.dto.LeadDto;
import com.everx.crm.webhook.CrmWebhookPublisher;
import com.everx.shared.exception.EntityNotFoundException;
import com.everx.shared.util.SecurityUserContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.UUID;
import java.util.Map;

@Service
@Transactional
@Slf4j
public class LeadConversionService {

    private static final String MODULE_CRM = "CRM";
    private static final String ENTITY_DEAL = "DEAL";
    private static final String FIELD_STAGE = "stage";
    private static final String ENTITY_LEAD = "LEAD";
    private static final String ENTITY_ACCOUNT = "ACCOUNT";
    private static final String ENTITY_CONTACT = "CONTACT";
    private static final String EVENT_CREATED = "created";
    private static final String EVENT_CONVERTED = "converted";

    @Autowired
    private LeadRepository leadRepository;

    @Autowired
    private ContactRepository contactRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private DealRepository dealRepository;

    @Autowired
    private OptionSetService optionSetService;

    @Autowired
    private CrmWebhookPublisher crmWebhookPublisher;

    public LeadDto convertLead(UUID leadId, LeadConvertRequest request) {
        log.info("Converting lead {}", leadId);

        Lead lead = leadRepository.findByIdActive(leadId)
                .orElseThrow(() -> new EntityNotFoundException("Lead not found with id: " + leadId));

        if (Boolean.TRUE.equals(lead.getIsConverted())) {
            throw new IllegalStateException("Lead is already converted");
        }

        UUID ownerId = lead.getOwnerId() != null ? lead.getOwnerId() : SecurityUserContext.getCurrentUserIdOrNull();

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
                .ownerId(ownerId)
                .build();
        Contact savedContact = contactRepository.save(contact);
        lead.setConvertedContactId(savedContact.getId());
        crmWebhookPublisher.publish(ENTITY_CONTACT, EVENT_CREATED, savedContact.getId(),
            ContactDto.fromEntity(savedContact), Map.of("leadId", lead.getId()));

        // 2. Create or link Account
        if (Boolean.TRUE.equals(request.getCreateAccount())) {
            String resolvedAccountName = request.getAccountName() != null && !request.getAccountName().trim().isEmpty()
                ? request.getAccountName().trim()
                : (lead.getCompany() != null ? lead.getCompany().trim() : null);

            if (resolvedAccountName == null || resolvedAccountName.isEmpty()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Account name is required when creating an account during lead conversion"
            );
            }

            Account account = Account.builder()
                .name(resolvedAccountName)
                    .phone(lead.getPhone())
                    .email(lead.getEmail())
                    .billingStreet(lead.getStreet())
                    .billingCity(lead.getCity())
                    .billingState(lead.getState())
                    .billingZip(lead.getZip())
                    .billingCountry(lead.getCountry())
                    .annualRevenue(lead.getAnnualRevenue())
                    .employees(lead.getEmployees())
                    .ownerId(ownerId)
                    .build();
            Account savedAccount = accountRepository.save(account);
            lead.setConvertedAccountId(savedAccount.getId());
            savedContact.setAccountId(savedAccount.getId());
            contactRepository.save(savedContact);
                crmWebhookPublisher.publish(ENTITY_ACCOUNT, EVENT_CREATED, savedAccount.getId(),
                    AccountDto.fromEntity(savedAccount), Map.of("leadId", lead.getId()));
        }

        // 3. Create Deal (optional)
        if (Boolean.TRUE.equals(request.getCreateDeal())) {
            String defaultStage = optionSetService.resolveDefaultValue(MODULE_CRM, ENTITY_DEAL, FIELD_STAGE, "PROSPECTING");
            Deal deal = Deal.builder()
                    .name(request.getDealName() != null ? request.getDealName() : lead.getFirstName() + " " + lead.getLastName() + " - Deal")
                .stage(defaultStage)
                    .amount(request.getDealAmount())
                    .expectedCloseDate(request.getExpectedCloseDate())
                    .leadSource(lead.getLeadSource())
                    .accountId(lead.getConvertedAccountId())
                    .primaryContactId(savedContact.getId())
                    .ownerId(ownerId)
                    .build();
            Deal savedDeal = dealRepository.save(deal);
            lead.setConvertedDealId(savedDeal.getId());
                crmWebhookPublisher.publish(ENTITY_DEAL, EVENT_CREATED, savedDeal.getId(),
                    DealDto.fromEntity(savedDeal), Map.of("leadId", lead.getId()));
        }

        // 4. Mark lead as converted
        lead.setIsConverted(true);
        lead.setConvertedAt(OffsetDateTime.now());
        lead.setStatus("CONVERTED");
        Lead savedLead = leadRepository.save(lead);
        LeadDto dto = LeadDto.fromEntity(savedLead);
        crmWebhookPublisher.publish(ENTITY_LEAD, EVENT_CONVERTED, savedLead.getId(), dto);
        return dto;
    }
}
