package com.everx.finance.repository;

import com.everx.finance.entity.FixedAsset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface FixedAssetRepository extends JpaRepository<FixedAsset, Long> {
    Optional<FixedAsset> findByAssetCode(String assetCode);
    
    List<FixedAsset> findByStatus(FixedAsset.AssetStatus status);
    
    List<FixedAsset> findByCategoryId(Long categoryId);
    
    @Query("SELECT f FROM FixedAsset f WHERE f.status = 'ACTIVE' AND f.acquisitionDate <= :date")
    List<FixedAsset> findActiveAssetsAsOf(@Param("date") LocalDate date);
    
    @Query("SELECT f FROM FixedAsset f WHERE f.depreciationMethod = :method")
    List<FixedAsset> findByDepreciationMethod(@Param("method") FixedAsset.DepreciationMethod method);
}
