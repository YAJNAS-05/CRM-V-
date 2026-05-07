package com.everx.platform.config.entity;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(
        name = "custom_field_definitions",
        schema = "everx_shared",
        uniqueConstraints = @UniqueConstraint(columnNames = {"module", "entity", "field_key"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class CustomFieldDefinition extends BaseEntity {

    @Column(name = "module", nullable = false, length = 50)
    private String module;

    @Column(name = "entity", nullable = false, length = 50)
    private String entity;

    @Column(name = "field_key", nullable = false, length = 60)
    private String fieldKey;

    @Column(name = "label", nullable = false, length = 120)
    private String label;

    @Column(name = "data_type", nullable = false, length = 30)
    private String dataType;

    @Column(name = "help_text", columnDefinition = "TEXT")
    private String helpText;

    @Column(name = "default_value", columnDefinition = "TEXT")
    private String defaultValue;

    @Column(name = "options_json", columnDefinition = "TEXT")
    private String optionsJson;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;

    @Column(name = "is_required", nullable = false)
    @lombok.Builder.Default
    private Boolean isRequired = false;

    @Column(name = "is_active", nullable = false)
    @lombok.Builder.Default
    private Boolean isActive = true;

    @Column(name = "is_system", nullable = false)
    @lombok.Builder.Default
    private Boolean isSystem = false;
}
