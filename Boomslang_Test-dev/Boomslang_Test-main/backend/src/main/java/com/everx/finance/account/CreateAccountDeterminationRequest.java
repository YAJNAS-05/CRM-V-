package com.everx.finance.account;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

/**
 * Request DTO for creating/updating account determinations.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateAccountDeterminationRequest {
    private String companyCode;        // Entity code: AU01, US01, etc.
    private String transactionKey;     // Transaction type: BSX, GBB, ARC, etc.
    private String valuationClass;     // Valuation class: EQUIP, PARTS, SERVICE, etc.
    private String glAccount;          // GL account number to post to
    private String description;        // Optional description
    private LocalDate effectiveFrom;   // When this mapping becomes effective
    private LocalDate effectiveTo;     // Optional end date
}
