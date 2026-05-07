package com.everx.crm.lead;

import com.everx.crm.lead.dto.CreateLeadRequest;
import com.everx.crm.lead.dto.LeadDto;
import com.everx.crm.lead.dto.UpdateLeadRequest;
import com.everx.crm.webhook.CrmWebhookPublisher;
import com.everx.shared.util.SecurityUserContext;
import com.everx.shared.exception.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.Map;

@Service
@Transactional
@Slf4j
public class LeadService {

    private static final String ENTITY_LEAD = "LEAD";

    @Autowired
    private LeadRepository leadRepository;

    @Autowired
    private CrmWebhookPublisher crmWebhookPublisher;

    public Page<LeadDto> getAllLeads(Pageable pageable) {
        log.info("Fetching leads page {} size {}", pageable.getPageNumber(), pageable.getPageSize());
        return leadRepository.findAllActive(pageable).map(LeadDto::fromEntity);
    }

    public Page<LeadDto> searchLeads(String query, String status, String source, Pageable pageable) {
        String normalizedQuery = query != null ? query.trim() : null;
        String normalizedStatus = status != null && !status.isBlank() ? status.trim() : null;
        String normalizedSource = source != null && !source.isBlank() ? source.trim() : null;
        log.info("Searching leads with query {} status {} source {}", normalizedQuery, normalizedStatus, normalizedSource);
        return leadRepository.search(normalizedQuery, normalizedStatus, normalizedSource, pageable)
                .map(LeadDto::fromEntity);
    }

    public LeadDto getLeadById(UUID leadId) {
        log.info("Fetching lead {}", leadId);
        Lead lead = leadRepository.findByIdActive(leadId)
                .orElseThrow(() -> new EntityNotFoundException("Lead not found with id: " + leadId));
        return LeadDto.fromEntity(lead);
    }

    public LeadDto createLead(CreateLeadRequest request) {
        log.info("Creating lead {} {}", request.getFirstName(), request.getLastName());
        UUID ownerId = request.getOwnerId() != null ? request.getOwnerId() : SecurityUserContext.getCurrentUserIdOrNull();

        Lead lead = Lead.builder()
                .salutation(request.getSalutation())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .title(request.getFirstName() + " " + request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .mobile(request.getMobile())
                .company(request.getCompany())
                .jobTitle(request.getJobTitle())
                .leadSource(request.getLeadSource())
                .status(request.getStatus() != null ? request.getStatus() : "NEW")
                .rating(request.getRating())
                .website(request.getWebsite())
                .street(request.getStreet())
                .city(request.getCity())
                .state(request.getState())
                .zip(request.getZip())
                .country(request.getCountry())
                .annualRevenue(request.getAnnualRevenue())
                .employees(request.getEmployees())
                .description(request.getDescription())
                .isConverted(false)
                .ownerId(ownerId)
                .build();
            Lead saved = leadRepository.save(lead);
            LeadDto dto = LeadDto.fromEntity(saved);
            crmWebhookPublisher.publish(ENTITY_LEAD, "created", saved.getId(), dto);
            return dto;
    }

    public LeadDto updateLead(UUID leadId, UpdateLeadRequest request) {
        log.info("Updating lead {}", leadId);
        Lead lead = leadRepository.findByIdActive(leadId)
                .orElseThrow(() -> new EntityNotFoundException("Lead not found with id: " + leadId));

        if (request.getSalutation() != null) lead.setSalutation(request.getSalutation());
        if (request.getFirstName() != null) lead.setFirstName(request.getFirstName());
        if (request.getLastName() != null) lead.setLastName(request.getLastName());
        if (request.getEmail() != null) lead.setEmail(request.getEmail());
        if (request.getPhone() != null) lead.setPhone(request.getPhone());
        if (request.getMobile() != null) lead.setMobile(request.getMobile());
        if (request.getCompany() != null) lead.setCompany(request.getCompany());
        if (request.getJobTitle() != null) lead.setJobTitle(request.getJobTitle());
        if (request.getLeadSource() != null) lead.setLeadSource(request.getLeadSource());
        if (request.getStatus() != null) lead.setStatus(request.getStatus());
        if (request.getRating() != null) lead.setRating(request.getRating());
        if (request.getWebsite() != null) lead.setWebsite(request.getWebsite());
        if (request.getStreet() != null) lead.setStreet(request.getStreet());
        if (request.getCity() != null) lead.setCity(request.getCity());
        if (request.getState() != null) lead.setState(request.getState());
        if (request.getZip() != null) lead.setZip(request.getZip());
        if (request.getCountry() != null) lead.setCountry(request.getCountry());
        if (request.getAnnualRevenue() != null) lead.setAnnualRevenue(request.getAnnualRevenue());
        if (request.getEmployees() != null) lead.setEmployees(request.getEmployees());
        if (request.getDescription() != null) lead.setDescription(request.getDescription());
        if (request.getOwnerId() != null) lead.setOwnerId(request.getOwnerId());
        Lead saved = leadRepository.save(lead);
        LeadDto dto = LeadDto.fromEntity(saved);
        crmWebhookPublisher.publish(ENTITY_LEAD, "updated", saved.getId(), dto);
        return dto;
    }

    public void deleteLead(UUID leadId) {
        log.info("Soft deleting lead {}", leadId);
        Lead lead = leadRepository.findByIdActive(leadId)
                .orElseThrow(() -> new EntityNotFoundException("Lead not found with id: " + leadId));
        lead.softDelete();
        Lead saved = leadRepository.save(lead);
        LeadDto dto = LeadDto.fromEntity(saved);
        crmWebhookPublisher.publish(ENTITY_LEAD, "deleted", saved.getId(), dto, Map.of("deleted", true));
    }

    public Page<LeadDto> getLeadsByAccount(UUID accountId, Pageable pageable) {
        log.info("Fetching leads for account {}", accountId);
        return leadRepository.findByAccountId(accountId, pageable).map(LeadDto::fromEntity);
    }

    public Page<LeadDto> getLeadsByStatus(String status, Pageable pageable) {
        log.info("Fetching leads by status {}", status);
        return leadRepository.findByStatus(status, pageable).map(LeadDto::fromEntity);
    }
}
