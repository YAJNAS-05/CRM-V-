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
@Table(name = "custom_field_values", schema = "everx_shared")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class CustomFieldValue extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "field_definition_id", nullable = false)
    private CustomFieldDefinition definition;

    @Column(name = "entity_id", nullable = false, length = 64)
    private String entityId;

    @Column(name = "value", columnDefinition = "TEXT")
    private String value;
}
