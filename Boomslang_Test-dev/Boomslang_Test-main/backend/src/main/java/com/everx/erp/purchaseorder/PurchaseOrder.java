package com.everx.erp.purchaseorder;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "purchase_order", schema = "everx_erp")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class PurchaseOrder extends BaseEntity {
    @Column(name = "po_number", nullable = false, unique = true)
    private String poNumber;
    @Column(name = "vendor_id", nullable = false)
    private UUID vendorId;
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
