package com.everx.finance.currency;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CurrencyRateRepository extends JpaRepository<CurrencyRate, UUID> {

    Optional<CurrencyRate> findByIdAndIsDeletedFalse(UUID id);

    @Query("SELECT cr FROM CurrencyRate cr WHERE cr.isDeleted = false AND cr.baseCurrency = :baseCurrency AND cr.targetCurrency = :targetCurrency ORDER BY cr.fetchedAt DESC")
    Optional<CurrencyRate> findLatestRate(@Param("baseCurrency") String baseCurrency, @Param("targetCurrency") String targetCurrency);

    @Query("SELECT cr FROM CurrencyRate cr WHERE cr.isDeleted = false AND cr.baseCurrency = :baseCurrency ORDER BY cr.fetchedAt DESC")
    List<CurrencyRate> findByBaseCurrency(@Param("baseCurrency") String baseCurrency);

    @Query("SELECT cr FROM CurrencyRate cr WHERE cr.isDeleted = false ORDER BY cr.fetchedAt DESC")
    List<CurrencyRate> findAllLatest();
}
