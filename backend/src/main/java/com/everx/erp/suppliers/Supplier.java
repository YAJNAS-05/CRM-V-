package com.everx.erp.suppliers;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "suppliers", schema = "everx_erp")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Supplier extends BaseEntity {

    @Column(name = "company_name", nullable = false, length = 255)
    private String companyName;

    @Column(length = 100)
    private String country;

    @Column(name = "contact_name", length = 255)
    private String contactName;

    @Column(length = 255)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(name = "supplier_type", length = 50)
    private String supplierType;

    @Column(name = "payment_terms", columnDefinition = "TEXT")
    private String paymentTerms;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
