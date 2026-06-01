package com.everx.finance.repository;

import com.everx.finance.entity.TaxCalculation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaxCalculationRepository extends JpaRepository<TaxCalculation, Long> {
    List<TaxCalculation> findByTaxConfigId(Long taxConfigId);
    
    @Query("SELECT t FROM TaxCalculation t WHERE t.taxPeriodStart >= :startDate AND t.taxPeriodEnd <= :endDate")
    List<TaxCalculation> findByTaxPeriod(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    List<TaxCalculation> findByStatus(TaxCalculation.TaxCalculationStatus status);
}
