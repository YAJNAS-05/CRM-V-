package com.everx.crm.contact;

import com.everx.crm.contact.dto.ContactDto;
import com.everx.crm.contact.dto.CreateContactRequest;
import com.everx.crm.contact.dto.UpdateContactRequest;
import com.everx.shared.exception.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
@Slf4j
public class ContactService {

    @Autowired
    private ContactRepository contactRepository;

    public Page<ContactDto> getAllContacts(Pageable pageable) {
        log.info("Fetching contacts page {} size {}", pageable.getPageNumber(), pageable.getPageSize());
        return contactRepository.findAllActive(pageable).map(ContactDto::fromEntity);
    }

    public ContactDto getContactById(UUID contactId) {
        log.info("Fetching contact {}", contactId);
        Contact contact = contactRepository.findById(contactId)
                .orElseThrow(() -> new EntityNotFoundException("Contact not found with id: " + contactId));
        return ContactDto.fromEntity(contact);
    }

    public ContactDto createContact(CreateContactRequest request) {
        log.info("Creating contact {} {}", request.getFirstName(), request.getLastName());
        Contact contact = Contact.builder()
                .accountId(request.getAccountId())
                .salutation(request.getSalutation())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .mobile(request.getMobile())
                .jobTitle(request.getJobTitle())
                .department(request.getDepartment())
                .gender(request.getGender())
                .dateOfBirth(request.getDateOfBirth())
                .leadSource(request.getLeadSource())
                .mailingStreet(request.getMailingStreet())
                .mailingCity(request.getMailingCity())
                .mailingState(request.getMailingState())
                .mailingZip(request.getMailingZip())
                .mailingCountry(request.getMailingCountry())
                .linkedinUrl(request.getLinkedinUrl())
                .twitterHandle(request.getTwitterHandle())
                .description(request.getDescription())
                .doNotCall(request.getDoNotCall() != null ? request.getDoNotCall() : false)
                .emailOptOut(request.getEmailOptOut() != null ? request.getEmailOptOut() : false)
                .ownerId(request.getOwnerId())
                .build();
        return ContactDto.fromEntity(contactRepository.save(contact));
    }

    public ContactDto updateContact(UUID contactId, UpdateContactRequest request) {
        log.info("Updating contact {}", contactId);
        Contact contact = contactRepository.findById(contactId)
                .orElseThrow(() -> new EntityNotFoundException("Contact not found with id: " + contactId));

        if (request.getAccountId() != null) contact.setAccountId(request.getAccountId());
        if (request.getSalutation() != null) contact.setSalutation(request.getSalutation());
        if (request.getFirstName() != null) contact.setFirstName(request.getFirstName());
        if (request.getLastName() != null) contact.setLastName(request.getLastName());
        if (request.getEmail() != null) contact.setEmail(request.getEmail());
        if (request.getPhone() != null) contact.setPhone(request.getPhone());
        if (request.getMobile() != null) contact.setMobile(request.getMobile());
        if (request.getJobTitle() != null) contact.setJobTitle(request.getJobTitle());
        if (request.getDepartment() != null) contact.setDepartment(request.getDepartment());
        if (request.getGender() != null) contact.setGender(request.getGender());
        if (request.getDateOfBirth() != null) contact.setDateOfBirth(request.getDateOfBirth());
        if (request.getLeadSource() != null) contact.setLeadSource(request.getLeadSource());
        if (request.getMailingStreet() != null) contact.setMailingStreet(request.getMailingStreet());
        if (request.getMailingCity() != null) contact.setMailingCity(request.getMailingCity());
        if (request.getMailingState() != null) contact.setMailingState(request.getMailingState());
        if (request.getMailingZip() != null) contact.setMailingZip(request.getMailingZip());
        if (request.getMailingCountry() != null) contact.setMailingCountry(request.getMailingCountry());
        if (request.getLinkedinUrl() != null) contact.setLinkedinUrl(request.getLinkedinUrl());
        if (request.getTwitterHandle() != null) contact.setTwitterHandle(request.getTwitterHandle());
        if (request.getDescription() != null) contact.setDescription(request.getDescription());
        if (request.getDoNotCall() != null) contact.setDoNotCall(request.getDoNotCall());
        if (request.getEmailOptOut() != null) contact.setEmailOptOut(request.getEmailOptOut());
        if (request.getOwnerId() != null) contact.setOwnerId(request.getOwnerId());

        return ContactDto.fromEntity(contactRepository.save(contact));
    }

    public void deleteContact(UUID contactId) {
        log.info("Soft deleting contact {}", contactId);
        Contact contact = contactRepository.findById(contactId)
                .orElseThrow(() -> new EntityNotFoundException("Contact not found with id: " + contactId));
        contact.softDelete();
        contactRepository.save(contact);
    }

    public Page<ContactDto> getContactsByAccountId(UUID accountId, Pageable pageable) {
        log.info("Fetching contacts for account {}", accountId);
        return contactRepository.findByAccountId(accountId, pageable).map(ContactDto::fromEntity);
    }
}
