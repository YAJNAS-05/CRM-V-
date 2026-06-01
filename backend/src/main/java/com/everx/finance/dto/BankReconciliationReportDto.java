package com.everx.finance.dto;

import com.everx.finance.entity.BankStatementLine;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BankReconciliationReportDto {
    private Long reconciliationId;
    private String accountNumber;
    private LocalDate statementDate;
    private BigDecimal glBalance;
    private BigDecimal bankBalance;
    private BigDecimal difference;
    private Integer totalLines;
    private Integer matchedCount;
    private Integer unmatchedCount;
    private BigDecimal unmatchedAmount;
    private String status;
    private List<BankStatementLine> unmatchedLines;
}
