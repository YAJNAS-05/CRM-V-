package com.everx.erp.salesorder;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "sales_order", schema = "everx_erp")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class SalesOrder extends BaseEntity {
    @Column(name = "so_number", nullable = false, unique = true)
    private String soNumber;
    @Column(name = "customer_id", nullable = false)
    private UUID customerId;
    @Column(name = "company_code", nullable = false, length = 10)
    private String companyCode;
    @Column(name = "order_date")
    private java.time.LocalDate orderDate;
    @Column(name = "delivery_date")
    private java.time.LocalDate deliveryDate;
    @Column(name = "total_amount")
    private BigDecimal totalAmount;
    @Column(name = "currency", length = 3)
    private String currency;
    @Column(name = "status", length = 20)
    private String status;
}
