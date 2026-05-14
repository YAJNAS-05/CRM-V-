package com.everx.crm.contact;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "contacts", schema = "everx_crm")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Contact extends BaseEntity {

    @Column(name = "account_id")
    private UUID accountId;

    @Column(name = "salutation", length = 10)
    private String salutation;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "email", length = 255)
    private String email;

    @Column(name = "phone", length = 30)
    private String phone;

    @Column(name = "mobile", length = 30)
    private String mobile;

    @Column(name = "job_title", length = 150)
    private String jobTitle;

    @Column(name = "department", length = 100)
    private String department;

    @Column(name = "gender", length = 20)
    private String gender;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "lead_source", length = 50)
    private String leadSource;

    @Column(name = "mailing_street")
    private String mailingStreet;

    @Column(name = "mailing_city", length = 100)
    private String mailingCity;

    @Column(name = "mailing_state", length = 100)
    private String mailingState;

    @Column(name = "mailing_zip", length = 20)
    private String mailingZip;

    @Column(name = "mailing_country", length = 100)
    private String mailingCountry;

    @Column(name = "linkedin_url")
    private String linkedinUrl;

    @Column(name = "twitter_handle", length = 100)
    private String twitterHandle;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "do_not_call")
    @lombok.Builder.Default
    private Boolean doNotCall = false;

    @Column(name = "email_opt_out")
    @lombok.Builder.Default
    private Boolean emailOptOut = false;

    @Column(name = "owner_id")
    private UUID ownerId;

    // Legacy fields kept for backward compatibility
    @Column(name = "country")
    private String country;

    @Column(name = "preferred_language")
    private String preferredLanguage;

    @Column(name = "whatsapp_number")
    private String whatsappNumber;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}
