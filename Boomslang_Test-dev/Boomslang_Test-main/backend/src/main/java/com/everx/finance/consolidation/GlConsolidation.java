package com.everx.finance.consolidation;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "gl_consolidation", schema = "everx_finance")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class GlConsolidation extends BaseEntity {

    @Column(name = "consolidation_id", nullable = false)
    private java.util.UUID consolidationId;

    @Column(name = "company_code", nullable = false, length = 10)
    private String companyCode;

    @Column(name = "fiscal_period", nullable = false, length = 7)
    private String fiscalPeriod;

    @Column(name = "gl_account", length = 10)
    private String glAccount;

    @Column(name = "local_currency", length = 3)
    private String localCurrency;

    @Column(name = "local_balance")
    private java.math.BigDecimal localBalance;

    @Column(name = "reporting_currency", length = 3)
    private String reportingCurrency;

    @Column(name = "reporting_balance")
    private java.math.BigDecimal reportingBalance;

    @Column(name = "exchange_rate")
    private java.math.BigDecimal exchangeRate;

    @Column(name = "consolidation_type", length = 20)
    private String consolidationType;
}
