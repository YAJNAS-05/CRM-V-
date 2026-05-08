package com.everx.finance.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private UUID id;
    private String paymentNumber;
    private UUID customerId;
    private String customerName;
    private String companyCode;
    private LocalDateTime paymentDate;
    private BigDecimal amount;
    private String currency;
    private String paymentMethod;
    private String status;
    private UUID invoiceId;
}
