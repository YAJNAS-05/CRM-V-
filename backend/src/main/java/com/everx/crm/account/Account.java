package com.everx.crm.account;

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
import java.util.UUID;

@Entity
@Table(name = "accounts", schema = "everx_crm")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Account extends BaseEntity {

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "industry", length = 100)
    private String industry;

    @Column(name = "account_type", length = 50)
    private String accountType;

    @Column(name = "website")
    private String website;

    @Column(name = "phone", length = 30)
    private String phone;

    @Column(name = "email", length = 255)
    private String email;

    @Column(name = "billing_street")
    private String billingStreet;

    @Column(name = "billing_city", length = 100)
    private String billingCity;

    @Column(name = "billing_state", length = 100)
    private String billingState;

    @Column(name = "billing_zip", length = 20)
    private String billingZip;

    @Column(name = "billing_country", length = 100)
    private String billingCountry;

    @Column(name = "annual_revenue")
    private BigDecimal annualRevenue;

    @Column(name = "employees")
    private Integer employees;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "owner_id")
    private UUID ownerId;

    // Legacy fields kept for backward compatibility
    @Column(name = "country")
    private String country;

    @Column(name = "region")
    private String region;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "tags", columnDefinition = "TEXT ARRAY")
    private String[] tags;
}
