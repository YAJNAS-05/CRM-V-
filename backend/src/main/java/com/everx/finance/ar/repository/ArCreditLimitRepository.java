package com.everx.finance.ar.repository;

import com.everx.finance.ar.entity.ArCreditLimit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for AR Credit Limits
 */
@Repository
public interface ArCreditLimitRepository extends JpaRepository<ArCreditLimit, UUID> {

    Optional<ArCreditLimit> findByCustomerIdAndIsDeletedFalse(UUID customerId);

    Page<ArCreditLimit> findByStatusAndIsDeletedFalse(ArCreditLimit.Status status, Pageable pageable);

    List<ArCreditLimit> findByStatusAndIsDeletedFalse(ArCreditLimit.Status status);

    @Query("SELECT acl FROM ArCreditLimit acl WHERE acl.expiryDate < :today " +
           "AND acl.status = 'ACTIVE' AND acl.isDeleted = false")
    List<ArCreditLimit> findExpiredLimits(@Param("today") LocalDate today);
}
