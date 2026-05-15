package com.everx.erp.mapping;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Entity
@Table(name = "erp_field_mappings", schema = "everx_erp")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class ERPFieldMapping extends BaseEntity {

    @Column(name = "source_module", nullable = false)
    private String sourceModule; // e.g., "INVENTORY", "EQUIPMENT"

    @Column(name = "target_module", nullable = false)
    private String targetModule; // e.g., "SALES_ORDER", "PURCHASE_ORDER"

    @Column(name = "source_field", nullable = false)
    private String sourceField;

    @Column(name = "target_field", nullable = false)
    private String targetField;

    @Column(name = "is_required", nullable = false)
    private Boolean isRequired = false;

    @Column(name = "is_auto_populated")
    private Boolean isAutoPopulated = false;

    @Column(name = "mapping_type")
    private String mappingType; // DIRECT, LOOKUP, FORMULA, STATIC

    @Column(name = "lookup_values", columnDefinition = "TEXT")
    private String lookupValues; // JSON array of available options

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "description")
    private String description;
}
