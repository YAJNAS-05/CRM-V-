package com.everx.auth.repository;

import com.everx.auth.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    // Role.permissions is EAGER — fetch only assignedRoles here to avoid Hibernate fetch join conflicts.
    @Query("SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.assignedRoles ar WHERE u.email = :email AND u.isDeleted = false")
    Optional<User> findByEmailWithRolesAndPermissions(@Param("email") String email);

    @Query("SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.assignedRoles ar WHERE u.id = :userId AND u.isDeleted = false")
    Optional<User> findByIdWithRolesAndPermissions(@Param("userId") UUID userId);

    @Query("SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.assignedRoles ar WHERE u.authId = :authId AND u.isDeleted = false")
    Optional<User> findByAuthIdWithRolesAndPermissions(@Param("authId") UUID authId);

    @Query("SELECT DISTINCT u FROM User u LEFT JOIN u.assignedRoles ar WHERE u.isDeleted = false ORDER BY u.createdAt DESC")
    Page<User> findAllActive(Pageable pageable);

    @Query("SELECT DISTINCT u FROM User u LEFT JOIN u.assignedRoles ar WHERE u.isDeleted = false AND (u.role = :role OR ar.name = :role)")
    Page<User> findByRole(@Param("role") User.UserRole role, Pageable pageable);

    @Query("SELECT DISTINCT u FROM User u LEFT JOIN u.assignedRoles ar WHERE u.isDeleted = false AND ar.name = :roleName")
    Page<User> findByAssignedRoleName(@Param("roleName") String roleName, Pageable pageable);

    @Query("SELECT COUNT(u) > 0 FROM User u WHERE u.email = :email AND u.isDeleted = false")
    boolean existsActiveByEmail(@Param("email") String email);
}
