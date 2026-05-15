package com.everx.finance.tolerance;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.UUID;

/**
 * Response DTO for tolerance configurations.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceToleranceConfigResponse {
    private UUID id;
    private String companyCode;
    private BigDecimal tolerancePercentage;
    private BigDecimal toleranceAbsolute;
}
