package com.everx.finance.account;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Response DTO for account determinations.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountDeterminationResponse {
    private UUID id;
    private String companyCode;
    private String transactionKey;
    private String valuationClass;
    private String glAccount;
    private String description;
    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;
}
