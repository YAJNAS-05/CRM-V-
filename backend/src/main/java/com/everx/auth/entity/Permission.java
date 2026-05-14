package com.everx.auth.entity;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "permissions", schema = "everx_auth")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class Permission extends BaseEntity {

    @Column(name = "permission_key", nullable = false, unique = true, length = 100)
    private String permissionKey;

    @Column(name = "module", nullable = false, length = 100)
    private String module;

    @Column(name = "action", nullable = false, length = 100)
    private String action;

    @Column(name = "description")
    private String description;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}
