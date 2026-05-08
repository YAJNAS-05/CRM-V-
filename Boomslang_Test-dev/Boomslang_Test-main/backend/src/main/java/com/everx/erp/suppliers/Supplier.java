package com.everx.erp.suppliers;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import java.util.UUID;

@Entity
@Table(name = "supplier", schema = "everx_erp")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Supplier extends BaseEntity {
    @Column(name = "supplier_number", nullable = false, unique = true)
    private String supplierNumber;
    @Column(name = "name", nullable = false, length = 100)
    private String name;
    @Column(name = "contact_person", length = 100)
    private String contactPerson;
    @Column(name = "email", length = 100)
    private String email;
    @Column(name = "phone", length = 20)
    private String phone;
    @Column(name = "address", length = 200)
    private String address;
    @Column(name = "is_active", nullable = false)
    private Boolean isActive;
}
