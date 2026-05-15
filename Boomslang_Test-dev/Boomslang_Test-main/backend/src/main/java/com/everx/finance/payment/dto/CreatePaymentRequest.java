package com.everx.finance.payment.dto;

import com.everx.finance.payment.Payment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePaymentRequest {
    private UUID invoiceId;
    private BigDecimal amount;
    private String currency;
    private LocalDate paymentDate;
    private Payment.PaymentMethod method;
    private String reference;
    private BigDecimal exchangeRate;
    private BigDecimal audEquivalent;
    private String notes;
}
