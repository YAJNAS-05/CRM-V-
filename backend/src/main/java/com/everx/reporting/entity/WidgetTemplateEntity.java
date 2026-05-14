package com.everx.reporting.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "widget_templates", schema = "everx_reporting")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WidgetTemplateEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "template_id")
    private Long templateId;

    @Column(name = "template_name", nullable = false, length = 200)
    private String templateName;

    @Column(name = "widget_type", nullable = false, length = 50)
    private String widgetType;

    @Column(name = "default_config", nullable = false, columnDefinition = "JSON")
    @JdbcTypeCode(SqlTypes.JSON)
    private Object defaultConfig;

    @Column(name = "icon")
    private String icon;

    @Column(name = "category")
    private String category;

    @Column(name = "is_system", nullable = false)
    private Boolean isSystem;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (isSystem == null) isSystem = false;
    }
}
