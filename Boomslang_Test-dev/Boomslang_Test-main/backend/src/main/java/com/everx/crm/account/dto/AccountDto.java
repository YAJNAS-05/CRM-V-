package com.everx.crm.account.dto;

import com.everx.crm.account.Account;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountDto {

    private UUID id;
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
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public static AccountDto fromEntity(Account account) {
        return AccountDto.builder()
                .id(account.getId())
                .name(account.getName())
                .industry(account.getIndustry())
                .accountType(account.getAccountType())
                .website(account.getWebsite())
                .phone(account.getPhone())
                .email(account.getEmail())
                .billingStreet(account.getBillingStreet())
                .billingCity(account.getBillingCity())
                .billingState(account.getBillingState())
                .billingZip(account.getBillingZip())
                .billingCountry(account.getBillingCountry())
                .annualRevenue(account.getAnnualRevenue())
                .employees(account.getEmployees())
                .description(account.getDescription())
                .ownerId(account.getOwnerId())
                .createdAt(account.getCreatedAt())
                .updatedAt(account.getUpdatedAt())
                .build();
    }
}
