package com.everx.finance.account;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountDeterminationResponse {
    private String glAccount;
    private String description;
    private String transactionKey;
    private String valuationClass;
}
