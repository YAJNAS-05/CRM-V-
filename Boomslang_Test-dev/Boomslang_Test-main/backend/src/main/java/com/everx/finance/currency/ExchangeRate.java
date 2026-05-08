package com.everx.finance.currency;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "exchange_rate", schema = "everx_finance")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class ExchangeRate extends BaseEntity {
    @Column(name = "from_currency", nullable = false, length = 3)
    private String fromCurrency;
    @Column(name = "to_currency", nullable = false, length = 3)
    private String toCurrency;
    @Column(name = "rate", nullable = false)
    private BigDecimal rate;
    @Column(name = "effective_date", nullable = false)
    private LocalDate effectiveDate;
}
