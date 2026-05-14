package com.everx.crm.lead.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeadConvertRequest {

    private Boolean createAccount;
    private String accountName;

    private Boolean createDeal;
    private String dealName;
    private BigDecimal dealAmount;
    private LocalDate expectedCloseDate;
}
