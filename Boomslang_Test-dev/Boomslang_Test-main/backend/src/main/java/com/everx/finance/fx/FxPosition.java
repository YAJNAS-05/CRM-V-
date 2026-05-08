package com.everx.finance.fx;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "fx_position", schema = "everx_finance")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class FxPosition extends BaseEntity {
    @Column(name = "company_code", nullable = false, length = 10)
    private String companyCode;
    @Column(name = "currency", length = 3)
    private String currency;
    @Column(name = "position_type", length = 20)
    private String positionType;
    @Column(name = "amount")
    private BigDecimal amount;
    @Column(name = "as_of_date")
    private LocalDateTime asOfDate;
}
