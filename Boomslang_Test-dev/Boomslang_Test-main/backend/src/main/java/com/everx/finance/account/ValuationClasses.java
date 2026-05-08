package com.everx.finance.account;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValuationClasses {
    private String classCode;
    private String description;
    private String materialType;
    private String valuationGroup;
}
