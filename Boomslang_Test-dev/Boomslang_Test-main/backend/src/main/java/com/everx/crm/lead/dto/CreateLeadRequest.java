package com.everx.crm.lead.dto;

import jakarta.validation.constraints.NotBlank;
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
public class CreateLeadRequest {

    private String salutation;

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
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
    private UUID ownerId;
}
