package com.everx.finance.currency;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "currency_rates", schema = "everx_erp", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"base_currency", "target_currency"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CurrencyRate extends BaseEntity {

    @Column(name = "base_currency", nullable = false, length = 3)
    private String baseCurrency;

    @Column(name = "target_currency", nullable = false, length = 3)
    private String targetCurrency;

    @Column(nullable = false, precision = 12, scale = 6)
    private BigDecimal rate;

    @Column(name = "fetched_at", nullable = false)
    private LocalDateTime fetchedAt;
}
