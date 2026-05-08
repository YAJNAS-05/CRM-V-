package com.everx.erp.subcontractors;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import java.util.UUID;

@Entity
@Table(name = "subcontractor", schema = "everx_erp")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Subcontractor extends BaseEntity {
    @Column(name = "name", nullable = false, length = 100)
    private String name;
    @Column(name = "specialization", length = 50)
    private String specialization;
    @Column(name = "contact_email", length = 100)
    private String contactEmail;
    @Column(name = "contact_phone", length = 20)
    private String contactPhone;
    @Column(name = "is_active", nullable = false)
    private Boolean isActive;
}
