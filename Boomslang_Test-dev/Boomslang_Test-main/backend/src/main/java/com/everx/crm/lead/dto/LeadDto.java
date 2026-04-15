package com.everx.crm.lead.dto;

import com.everx.crm.lead.Lead;
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
public class LeadDto {

    private UUID id;
    private String salutation;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String mobile;
    private String company;
    private String jobTitle;
    private String leadSource;
    private String status;
    private Integer rating;
    private String website;
    private String street;
    private String city;
    private String state;
    private String zip;
    private String country;
    private BigDecimal annualRevenue;
    private Integer employees;
    private String description;
    private Boolean isConverted;
    private OffsetDateTime convertedAt;
    private UUID convertedContactId;
    private UUID convertedAccountId;
    private UUID convertedDealId;
    private UUID ownerId;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public static LeadDto fromEntity(Lead lead) {
        return LeadDto.builder()
                .id(lead.getId())
                .salutation(lead.getSalutation())
                .firstName(lead.getFirstName())
                .lastName(lead.getLastName())
                .email(lead.getEmail())
                .phone(lead.getPhone())
                .mobile(lead.getMobile())
                .company(lead.getCompany())
                .jobTitle(lead.getJobTitle())
                .leadSource(lead.getLeadSource())
                .status(lead.getStatus())
                .rating(lead.getRating())
                .website(lead.getWebsite())
                .street(lead.getStreet())
                .city(lead.getCity())
                .state(lead.getState())
                .zip(lead.getZip())
                .country(lead.getCountry())
                .annualRevenue(lead.getAnnualRevenue())
                .employees(lead.getEmployees())
                .description(lead.getDescription())
                .isConverted(lead.getIsConverted())
                .convertedAt(lead.getConvertedAt())
                .convertedContactId(lead.getConvertedContactId())
                .convertedAccountId(lead.getConvertedAccountId())
                .convertedDealId(lead.getConvertedDealId())
                .ownerId(lead.getOwnerId())
                .createdAt(lead.getCreatedAt())
                .updatedAt(lead.getUpdatedAt())
                .build();
    }
}
