package com.everx.crm.account;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface AccountRepository extends JpaRepository<Account, UUID> {

    @Query("SELECT a FROM Account a WHERE a.isDeleted = false ORDER BY a.createdAt DESC")
    Page<Account> findAllActive(Pageable pageable);

    @Query("SELECT a FROM Account a WHERE a.isDeleted = false AND a.ownerId = :ownerId ORDER BY a.createdAt DESC")
    Page<Account> findByOwnerId(@Param("ownerId") UUID ownerId, Pageable pageable);

    @Query("SELECT a FROM Account a WHERE a.isDeleted = false AND lower(a.name) LIKE lower(concat('%', :name, '%')) ORDER BY a.createdAt DESC")
    Page<Account> findByNameContains(@Param("name") String name, Pageable pageable);
}
