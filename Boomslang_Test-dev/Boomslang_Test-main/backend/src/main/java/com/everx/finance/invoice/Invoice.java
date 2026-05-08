package com.everx.finance.invoice;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "invoice", schema = "everx_finance")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Invoice extends BaseEntity {
    @Column(name = "invoice_number", nullable = false, unique = true)
    private String invoiceNumber;
    @Column(name = "customer_id", nullable = false)
    private UUID customerId;
    @Column(name = "company_code", nullable = false, length = 10)
    private String companyCode;
    @Column(name = "invoice_date", nullable = false)
    private LocalDateTime invoiceDate;
    @Column(name = "due_date", nullable = false)
    private LocalDateTime dueDate;
    @Column(name = "total_amount", nullable = false)
    private BigDecimal totalAmount;
    @Column(name = "tax_amount")
    private BigDecimal taxAmount;
    @Column(name = "currency", length = 3)
    private String currency;
    @Column(name = "status", length = 20)
    private String status;
}
