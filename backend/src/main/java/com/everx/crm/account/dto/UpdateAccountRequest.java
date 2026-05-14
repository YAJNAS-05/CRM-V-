package com.everx.crm.account.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateAccountRequest {

    private String name;
    private String industry;
    private String accountType;
    private String website;
    private String phone;
    private String email;
    private String billingStreet;
    private String billingCity;
    private String billingState;
    private String billingZip;
    private String billingCountry;
    private BigDecimal annualRevenue;
    private Integer employees;
    private String description;
    private UUID ownerId;
}
