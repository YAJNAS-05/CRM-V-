package com.everx.finance.tolerance;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Result of 3-way match operation (PO → Receipt → Invoice)
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ThreeWayMatchResult {
    private boolean matched;
    private BigDecimal varianceAmount;
    private boolean varianceExceedsTolerance;
    private boolean requiresCreditMemo;
    private String varianceReason;
}
