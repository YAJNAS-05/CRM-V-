package com.everx.crm.contact;

import com.everx.crm.contact.dto.ContactDto;
import com.everx.crm.contact.dto.CreateContactRequest;
import com.everx.crm.contact.dto.UpdateContactRequest;
import com.everx.shared.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/crm/contacts")
@Validated
@Slf4j
public class ContactController {

    @Autowired
    private ContactService contactService;

    @GetMapping
    @PreAuthorize("hasAuthority('CRM_VIEW')")
    public ResponseEntity<ApiResponse<Page<ContactDto>>> getAllContacts(
            @PageableDefault(size = 20, page = 0, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/v1/crm/contacts");
        Page<ContactDto> contacts = contactService.getAllContacts(pageable);
        return ResponseEntity.ok(ApiResponse.ok(contacts, "Contacts retrieved successfully"));
    }

    @GetMapping("/{contactId}")
    @PreAuthorize("hasAuthority('CRM_VIEW')")
    public ResponseEntity<ApiResponse<ContactDto>> getContactById(@PathVariable UUID contactId) {
        log.info("GET /api/v1/crm/contacts/{}", contactId);
        ContactDto contact = contactService.getContactById(contactId);
        return ResponseEntity.ok(ApiResponse.ok(contact, "Contact retrieved successfully"));
    }

    @GetMapping("/account/{accountId}")
    @PreAuthorize("hasAuthority('CRM_VIEW')")
    public ResponseEntity<ApiResponse<Page<ContactDto>>> getContactsByAccount(
            @PathVariable UUID accountId,
            @PageableDefault(size = 20, page = 0, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/v1/crm/contacts/account/{}", accountId);
        Page<ContactDto> contacts = contactService.getContactsByAccountId(accountId, pageable);
        return ResponseEntity.ok(ApiResponse.ok(contacts, "Contacts retrieved successfully"));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CRM_CREATE')")
    public ResponseEntity<ApiResponse<ContactDto>> createContact(@Valid @RequestBody CreateContactRequest request) {
        log.info("POST /api/v1/crm/contacts");
        ContactDto contact = contactService.createContact(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(contact, "Contact created successfully"));
    }

    @PutMapping("/{contactId}")
    @PreAuthorize("hasAuthority('CRM_EDIT')")
    public ResponseEntity<ApiResponse<ContactDto>> updateContact(
            @PathVariable UUID contactId,
            @Valid @RequestBody UpdateContactRequest request) {
        log.info("PUT /api/v1/crm/contacts/{}", contactId);
        ContactDto contact = contactService.updateContact(contactId, request);
        return ResponseEntity.ok(ApiResponse.ok(contact, "Contact updated successfully"));
    }

    @DeleteMapping("/{contactId}")
    @PreAuthorize("hasAuthority('CRM_DELETE')")
    public ResponseEntity<ApiResponse<Void>> deleteContact(@PathVariable UUID contactId) {
        log.info("DELETE /api/v1/crm/contacts/{}", contactId);
        contactService.deleteContact(contactId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Contact deleted successfully"));
    }
}
