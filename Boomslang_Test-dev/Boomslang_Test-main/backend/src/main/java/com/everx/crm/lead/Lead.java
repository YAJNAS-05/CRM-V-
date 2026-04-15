package com.everx.crm.lead;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "leads", schema = "everx_crm")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Lead extends BaseEntity {

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

    @Column(name = "company", length = 255)
    private String company;

    @Column(name = "job_title", length = 150)
    private String jobTitle;

    @Column(name = "lead_source", length = 50)
    private String leadSource;

    @Column(name = "status", nullable = false, length = 50)
    private String status;

    @Column(name = "rating")
    private Integer rating;

    @Column(name = "website")
    private String website;

    @Column(name = "street")
    private String street;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "state", length = 100)
    private String state;

    @Column(name = "zip", length = 20)
    private String zip;

    @Column(name = "country", length = 100)
    private String country;

    @Column(name = "annual_revenue")
    private BigDecimal annualRevenue;

    @Column(name = "employees")
    private Integer employees;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_converted", nullable = false)
    @lombok.Builder.Default
    private Boolean isConverted = false;

    @Column(name = "converted_at")
    private OffsetDateTime convertedAt;

    @Column(name = "converted_contact_id")
    private UUID convertedContactId;

    @Column(name = "converted_account_id")
    private UUID convertedAccountId;

    @Column(name = "converted_deal_id")
    private UUID convertedDealId;

    @Column(name = "owner_id")
    private UUID ownerId;

    // Keep legacy fields for backward compat during migration
    @Column(name = "title")
    private String title;

    @Column(name = "account_id")
    private UUID accountId;

    @Column(name = "contact_id")
    private UUID contactId;

    @Column(name = "source", length = 50)
    private String source;

    @Column(name = "equipment_interest", columnDefinition = "text[]")
    private String[] equipmentInterest;

    @Column(name = "currency", length = 3)
    private String currency;

    @Column(name = "trade_show_id")
    private UUID tradeShowId;

    @Column(name = "follow_up_date")
    private java.time.LocalDate followUpDate;
}
