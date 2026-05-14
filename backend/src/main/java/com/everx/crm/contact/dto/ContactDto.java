package com.everx.crm.contact.dto;

import com.everx.crm.contact.Contact;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContactDto {

    private UUID id;
    private UUID accountId;
    private String salutation;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String mobile;
    private String jobTitle;
    private String department;
    private String gender;
    private LocalDate dateOfBirth;
    private String leadSource;
    private String mailingStreet;
    private String mailingCity;
    private String mailingState;
    private String mailingZip;
    private String mailingCountry;
    private String linkedinUrl;
    private String twitterHandle;
    private String description;
    private Boolean doNotCall;
    private Boolean emailOptOut;
    private UUID ownerId;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public static ContactDto fromEntity(Contact contact) {
        return ContactDto.builder()
                .id(contact.getId())
                .accountId(contact.getAccountId())
                .salutation(contact.getSalutation())
                .firstName(contact.getFirstName())
                .lastName(contact.getLastName())
                .email(contact.getEmail())
                .phone(contact.getPhone())
                .mobile(contact.getMobile())
                .jobTitle(contact.getJobTitle())
                .department(contact.getDepartment())
                .gender(contact.getGender())
                .dateOfBirth(contact.getDateOfBirth())
                .leadSource(contact.getLeadSource())
                .mailingStreet(contact.getMailingStreet())
                .mailingCity(contact.getMailingCity())
                .mailingState(contact.getMailingState())
                .mailingZip(contact.getMailingZip())
                .mailingCountry(contact.getMailingCountry())
                .linkedinUrl(contact.getLinkedinUrl())
                .twitterHandle(contact.getTwitterHandle())
                .description(contact.getDescription())
                .doNotCall(contact.getDoNotCall())
                .emailOptOut(contact.getEmailOptOut())
                .ownerId(contact.getOwnerId())
                .createdAt(contact.getCreatedAt())
                .updatedAt(contact.getUpdatedAt())
                .build();
    }
}
