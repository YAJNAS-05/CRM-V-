package com.everx.finance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;
import com.everx.finance.entity.FixedAsset;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FixedAssetRegisterDto {
    private Integer totalAssets;
    private BigDecimal totalGrossCost;
    private BigDecimal totalAccumulatedDepreciation;
    private BigDecimal totalNetBookValue;
    private List<FixedAsset> assets;
}
