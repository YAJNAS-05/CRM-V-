package com.everx.finance.currency;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import java.math.BigDecimal;

@Entity
@Table(name = "currency", schema = "everx_finance")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Currency extends BaseEntity {
    @Column(name = "currency_code", nullable = false, unique = true, length = 3)
    private String currencyCode;
    @Column(name = "name", nullable = false, length = 100)
    private String name;
    @Column(name = "symbol", length = 5)
    private String symbol;
    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
}
