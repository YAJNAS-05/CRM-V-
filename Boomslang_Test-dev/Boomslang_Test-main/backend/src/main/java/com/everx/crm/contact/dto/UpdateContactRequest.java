package com.everx.crm.contact.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateContactRequest {

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
}
