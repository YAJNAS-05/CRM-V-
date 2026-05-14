package com.everx.finance.tolerance;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

/**
 * Request DTO for creating/updating tolerance configurations.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateInvoiceToleranceConfigRequest {
    private String companyCode;           // Entity code: AU01, US01, JP01
    private BigDecimal tolerancePercentage; // Tolerance as % (e.g., 5.0 for 5%)
    private BigDecimal toleranceAbsolute;   // Tolerance as absolute amount (e.g., 100.00)
}
