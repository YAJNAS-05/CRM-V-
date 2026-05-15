package com.everx.auth.repository;

import com.everx.auth.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, UUID> {

    Optional<Permission> findByPermissionKey(String permissionKey);

    @Query("SELECT p FROM Permission p WHERE p.permissionKey IN :keys AND p.isDeleted = false AND p.isActive = true")
    List<Permission> findActiveByKeys(@Param("keys") Collection<String> keys);

    @Query("SELECT p FROM Permission p WHERE p.isDeleted = false AND p.isActive = true ORDER BY p.module, p.action")
    List<Permission> findAllActive();
}
