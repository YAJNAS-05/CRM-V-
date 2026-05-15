package com.everx.erp.purchaseorder;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "purchase_orders", schema = "everx_erp")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrder extends BaseEntity {

    @Column(name = "po_number", unique = true, nullable = false, length = 50)
    private String poNumber;

    @Column(name = "supplier_id", nullable = false)
    private UUID supplierId;

    @Column(nullable = false, length = 50)
    private String status = "DRAFT";

    @Column(name = "order_date")
    private LocalDate orderDate;

    @Column(name = "expected_delivery")
    private LocalDate expectedDelivery;

    @Column(name = "actual_delivery")
    private LocalDate actualDelivery;

    @Column(length = 3)
    private String currency;

    @Column(name = "total_amount", precision = 15, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "payment_method", length = 50)
    private String paymentMethod;

    @Column(name = "shipping_docs", columnDefinition = "TEXT ARRAY")
    private String[] shippingDocs;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @OneToMany(mappedBy = "purchaseOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PurchaseOrderItem> items = new ArrayList<>();
}
