package com.everx.platform.config.entity;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "option_values", schema = "everx_shared")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class OptionValue extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "option_set_id", nullable = false)
    private OptionSet optionSet;

    @Column(name = "value", nullable = false, length = 120)
    private String value;

    @Column(name = "label", nullable = false, length = 120)
    private String label;

    @Column(name = "color_code", length = 20)
    private String colorCode;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_active", nullable = false)
    @lombok.Builder.Default
    private Boolean isActive = true;

    @Column(name = "is_default", nullable = false)
    @lombok.Builder.Default
    private Boolean isDefault = false;
}
