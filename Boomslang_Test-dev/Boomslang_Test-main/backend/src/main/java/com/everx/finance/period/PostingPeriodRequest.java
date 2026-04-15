package com.everx.finance.period;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for posting period management (close/open operations).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostingPeriodRequest {
    private String companyCode;
    private Integer fiscalYear;
    private Integer period;
}
