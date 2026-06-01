package com.everx.finance.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "exchange_rates", schema = "everx_finance")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExchangeRate extends AuditEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "from_currency", nullable = false, length = 3)
    private String fromCurrency; // e.g., "USD"

    @Column(name = "to_currency", nullable = false, length = 3)
    private String toCurrency; // e.g., "EUR"

    @Column(name = "rate", nullable = false, precision = 20, scale = 6)
    private BigDecimal rate; // Exchange rate value

    @Column(name = "rate_date", nullable = false)
    private LocalDate rateDate; // Date of the rate

    @Column(name = "source", nullable = false, length = 50)
    private String source; // e.g., "ECB", "OANDA", "MANUAL"

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Version
    private Long version;

    @Override
    public String toString() {
        return "ExchangeRate{" +
                "id=" + id +
                ", fromCurrency='" + fromCurrency + '\'' +
                ", toCurrency='" + toCurrency + '\'' +
                ", rate=" + rate +
                ", rateDate=" + rateDate +
                ", source='" + source + '\'' +
                '}';
    }
}
