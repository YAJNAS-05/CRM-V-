package com.everx.finance.payment;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "payment", schema = "everx_finance")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Payment extends BaseEntity {
    @Column(name = "payment_number", nullable = false, unique = true)
    private String paymentNumber;
    @Column(name = "customer_id")
    private UUID customerId;
    @Column(name = "company_code", nullable = false, length = 10)
    private String companyCode;
    @Column(name = "payment_date", nullable = false)
    private LocalDateTime paymentDate;
    @Column(name = "amount", nullable = false)
    private BigDecimal amount;
    @Column(name = "currency", length = 3)
    private String currency;
    @Column(name = "payment_method", length = 20)
    private String paymentMethod;
    @Column(name = "status", length = 20)
    private String status;
}
