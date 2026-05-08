package com.everx.finance.account;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AccountDeterminationRepository extends JpaRepository<AccountDetermination, UUID> {

    @Query("SELECT a FROM AccountDetermination a WHERE a.companyCode = :companyCode AND a.transactionKey = :transactionKey AND a.valuationClass = :valuationClass AND a.isActive = true AND a.effectiveFrom <= :date AND (a.effectiveTo IS NULL OR a.effectiveTo >= :date)")
    Optional<AccountDetermination> findByKeys(@Param("companyCode") String companyCode, @Param("transactionKey") String transactionKey, @Param("valuationClass") String valuationClass, @Param("date") LocalDate date);
}
