package com.everx.finance.payment;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "payments", schema = "everx_erp")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Payment extends BaseEntity {

    @Column(name = "invoice_id", nullable = false)
    private UUID invoiceId;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(length = 3)
    private String currency;

    @Column(name = "payment_date", nullable = false)
    private LocalDate paymentDate;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private PaymentMethod method;

    @Column(length = 255)
    private String reference;

    @Column(name = "exchange_rate", precision = 12, scale = 6)
    private BigDecimal exchangeRate;

    @Column(name = "aud_equivalent", precision = 15, scale = 2)
    private BigDecimal audEquivalent;

    @Column(columnDefinition = "TEXT")
    private String notes;

    public enum PaymentMethod {
        WIRE_TRANSFER, LC, CREDIT_CARD, OTHER
    }
}
