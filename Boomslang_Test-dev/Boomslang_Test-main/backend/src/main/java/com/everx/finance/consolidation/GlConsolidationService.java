package com.everx.finance.consolidation;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GlConsolidationService {

    public List<GlConsolidation> getConsolidations(String companyCode, String fiscalPeriod) {
        return List.of();
    }

    @Transactional
    public void runConsolidation(String companyCode, String fiscalPeriod) {
    }
}
