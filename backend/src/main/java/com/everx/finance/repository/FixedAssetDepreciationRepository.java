package com.everx.finance.repository;

import com.everx.finance.entity.FixedAssetDepreciation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.YearMonth;
import java.util.List;

@Repository
public interface FixedAssetDepreciationRepository extends JpaRepository<FixedAssetDepreciation, Long> {
    List<FixedAssetDepreciation> findByAssetIdOrderByDepreciationMonthDesc(Long assetId);
    
    List<FixedAssetDepreciation> findByDepreciationMonth(YearMonth yearMonth);
    
    @Query("SELECT d FROM FixedAssetDepreciation d WHERE d.asset.id = :assetId AND d.depreciationMonth = :month")
    List<FixedAssetDepreciation> findByAssetAndMonth(@Param("assetId") Long assetId, @Param("month") YearMonth month);
    
    @Query("SELECT d FROM FixedAssetDepreciation d WHERE d.status = 'CALCULATED' AND d.depreciationMonth <= :month")
    List<FixedAssetDepreciation> findUnpostedDepreciations(@Param("month") YearMonth month);
}
