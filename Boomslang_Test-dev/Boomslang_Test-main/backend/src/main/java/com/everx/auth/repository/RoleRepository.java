package com.everx.auth.repository;

import com.everx.auth.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoleRepository extends JpaRepository<Role, UUID> {

    @Query("SELECT DISTINCT r FROM Role r LEFT JOIN FETCH r.permissions WHERE r.isDeleted = false AND r.isActive = true ORDER BY r.name")
    List<Role> findAllActiveWithPermissions();

    @Query("SELECT DISTINCT r FROM Role r LEFT JOIN FETCH r.permissions WHERE r.id = :roleId AND r.isDeleted = false")
    Optional<Role> findByIdWithPermissions(@Param("roleId") UUID roleId);

    @Query("SELECT DISTINCT r FROM Role r LEFT JOIN FETCH r.permissions WHERE r.name = :name AND r.isDeleted = false")
    Optional<Role> findByNameWithPermissions(@Param("name") String name);

    @Query("SELECT DISTINCT r FROM Role r LEFT JOIN FETCH r.permissions WHERE r.name IN :names AND r.isDeleted = false AND r.isActive = true")
    List<Role> findActiveByNamesWithPermissions(@Param("names") Collection<String> names);

    @Query("SELECT COUNT(r) > 0 FROM Role r WHERE r.name = :name AND r.isDeleted = false")
    boolean existsActiveByName(@Param("name") String name);
}
