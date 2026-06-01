package com.everx.finance.repository;

import com.everx.finance.entity.TaxConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TaxConfigurationRepository extends JpaRepository<TaxConfiguration, Long> {
    Optional<TaxConfiguration> findByTaxCode(String taxCode);
    
    List<TaxConfiguration> findByJurisdiction(String jurisdiction);
    
    List<TaxConfiguration> findByStatus(TaxConfiguration.TaxStatus status);
    
    List<TaxConfiguration> findByEffectiveDateLessThanEqualAndExpiryDateGreaterThanEqual(
            LocalDate startDate, LocalDate endDate);
}
