package com.everx.finance.service;

import com.everx.finance.account.entity.GlAccount;
import com.everx.finance.account.service.GlAccountService;
import com.everx.finance.dto.FixedAssetRegisterDto;
import com.everx.finance.entity.AssetCategory;
import com.everx.finance.entity.FixedAsset;
import com.everx.finance.entity.FixedAssetDepreciation;
import com.everx.finance.journal.entity.JournalEntry;
import com.everx.finance.journal.entity.JournalEntryLine;
import com.everx.finance.journal.entity.PostingPeriod;
import com.everx.finance.journal.repository.JournalEntryLineRepository;
import com.everx.finance.journal.repository.JournalEntryRepository;
import com.everx.finance.journal.repository.PostingPeriodRepository;
import com.everx.finance.repository.AssetCategoryRepository;
import com.everx.finance.repository.FixedAssetDepreciationRepository;
import com.everx.finance.repository.FixedAssetRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class FixedAssetService {
    private final FixedAssetRepository assetRepository;
    private final FixedAssetDepreciationRepository depreciationRepository;
    private final AssetCategoryRepository categoryRepository;
    private final JournalEntryRepository journalRepository;
    private final JournalEntryLineRepository lineRepository;
    private final PostingPeriodRepository postingPeriodRepository;
    private final GlAccountService glAccountService;

    /**
     * Create a fixed asset
     */
    public FixedAsset createAsset(FixedAsset asset, String createdBy) {
        log.info("Creating fixed asset: {}", asset.getAssetCode());
        
        if (assetRepository.findByAssetCode(asset.getAssetCode()).isPresent()) {
            throw new RuntimeException("Asset code already exists: " + asset.getAssetCode());
        }
        
        asset.setCreatedDate(LocalDate.now());
        asset.setCreatedBy(createdBy);
        asset.setUpdatedDate(LocalDate.now());
        asset.setUpdatedBy(createdBy);
        asset.setStatus(FixedAsset.AssetStatus.ACTIVE);
        asset.setAccumulatedDepreciation(BigDecimal.ZERO);
        asset.setBookValue(asset.getAcquisitionCost());
        
        return assetRepository.save(asset);
    }

    /**
     * Calculate monthly depreciation for all active assets
     */
    public List<FixedAssetDepreciation> calculateMonthlyDepreciation(YearMonth month) {
        log.info("Calculating depreciation for month: {}", month);
        
        List<FixedAsset> activeAssets = assetRepository.findByStatus(FixedAsset.AssetStatus.ACTIVE);
        
        for (FixedAsset asset : activeAssets) {
            FixedAssetDepreciation depreciation = calculateDepreciationForAsset(asset, month);
            depreciationRepository.save(depreciation);
        }
        
        return depreciationRepository.findByDepreciationMonth(month);
    }

    /**
     * Calculate depreciation for a single asset
     */
    private FixedAssetDepreciation calculateDepreciationForAsset(FixedAsset asset, YearMonth month) {
        BigDecimal depreciationAmount = BigDecimal.ZERO;
        
        switch (asset.getDepreciationMethod()) {
            case STRAIGHT_LINE:
                depreciationAmount = calculateStraightLineDepreciation(asset);
                break;
            case DECLINING_BALANCE:
                depreciationAmount = calculateDecliningBalanceDepreciation(asset);
                break;
            case SUM_OF_YEARS_DIGITS:
                depreciationAmount = calculateSumOfYearsDigitsDepreciation(asset, month);
                break;
        }
        
        BigDecimal newAccumulated = asset.getAccumulatedDepreciation().add(depreciationAmount);
        BigDecimal newBookValue = asset.getAcquisitionCost().subtract(newAccumulated);
        
        return FixedAssetDepreciation.builder()
                .asset(asset)
                .depreciationMonth(month)
                .depreciationAmount(depreciationAmount)
                .cumulativeDepreciation(newAccumulated)
                .bookValueAfter(newBookValue)
                .status(FixedAssetDepreciation.DepreciationStatus.CALCULATED)
                .build();
    }

    /**
     * Straight-line depreciation: (Cost - Salvage) / Useful Life (Years) / 12 months
     */
    private BigDecimal calculateStraightLineDepreciation(FixedAsset asset) {
        BigDecimal depreciableAmount = asset.getAcquisitionCost()
                .subtract(asset.getSalvageValue() != null ? asset.getSalvageValue() : BigDecimal.ZERO);
        
        BigDecimal annualDepreciation = depreciableAmount.divide(
                BigDecimal.valueOf(asset.getUsefulLifeYears()),
                4,
                RoundingMode.HALF_UP
        );
        
        return annualDepreciation.divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP);
    }

    /**
     * Declining balance depreciation: Book Value * (2 / Useful Life) / 12 months
     */
    private BigDecimal calculateDecliningBalanceDepreciation(FixedAsset asset) {
        BigDecimal rate = BigDecimal.valueOf(2).divide(
                BigDecimal.valueOf(asset.getUsefulLifeYears()),
                4,
                RoundingMode.HALF_UP
        );
        
        BigDecimal bookValue = asset.getAcquisitionCost().subtract(asset.getAccumulatedDepreciation());
        BigDecimal annualDepreciation = bookValue.multiply(rate);
        
        return annualDepreciation.divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP);
    }

    /**
     * Sum of years digits depreciation
     */
    private BigDecimal calculateSumOfYearsDigitsDepreciation(FixedAsset asset, YearMonth month) {
        // Calculate year number from acquisition date
        int yearsElapsed = month.getYear() - asset.getAcquisitionDate().getYear();
        int yearNumber = asset.getUsefulLifeYears() - yearsElapsed;
        
        if (yearNumber <= 0) yearNumber = 1;
        
        int sumOfYears = (asset.getUsefulLifeYears() * (asset.getUsefulLifeYears() + 1)) / 2;
        
        BigDecimal depreciableAmount = asset.getAcquisitionCost()
                .subtract(asset.getSalvageValue() != null ? asset.getSalvageValue() : BigDecimal.ZERO);
        
        BigDecimal annualDepreciation = depreciableAmount
                .multiply(BigDecimal.valueOf(yearNumber))
                .divide(BigDecimal.valueOf(sumOfYears), 4, RoundingMode.HALF_UP);
        
        return annualDepreciation.divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP);
    }

    /**
     * Post depreciation entries to GL
     */
    public void postDepreciationToGl(YearMonth month, String postedBy) {
        log.info("Posting depreciation to GL for month: {}", month);
        
        List<FixedAssetDepreciation> unposted = depreciationRepository.findUnpostedDepreciations(month);
        
        for (FixedAssetDepreciation depreciation : unposted) {
            FixedAsset asset = depreciation.getAsset();
            AssetCategory category = asset.getCategory();
            
                GlAccount expenseAccount = glAccountService.getAccountByCode(category.getExpenseGlAccount());
                PostingPeriod postingPeriod = resolvePostingPeriod(expenseAccount.getCompanyId(), LocalDate.now());

                // Create journal entry
                JournalEntry entry = JournalEntry.builder()
                    .entryNumber("JE-" + UUID.randomUUID())
                    .entryDate(LocalDate.now())
                    .postingDate(LocalDate.now())
                    .postingPeriod(postingPeriod)
                    .companyId(expenseAccount.getCompanyId())
                    .description("Depreciation for " + asset.getAssetName())
                    .status(JournalEntry.Status.DRAFT)
                    .build();
            
            journalRepository.save(entry);
            
            // Debit depreciation expense
                JournalEntryLine expenseLine = JournalEntryLine.builder()
                    .journalEntry(entry)
                    .glAccount(expenseAccount)
                    .debitAmount(depreciation.getDepreciationAmount())
                    .description("Depreciation expense")
                    .build();
            
            // Credit accumulated depreciation
                JournalEntryLine accumulatedLine = JournalEntryLine.builder()
                    .journalEntry(entry)
                    .glAccount(glAccountService.getAccountByCode(category.getDepreciationGlAccount()))
                    .creditAmount(depreciation.getDepreciationAmount())
                    .description("Accumulated depreciation")
                    .build();
            
            lineRepository.save(expenseLine);
            lineRepository.save(accumulatedLine);
            
            // Update depreciation status
            depreciation.setStatus(FixedAssetDepreciation.DepreciationStatus.POSTED);
            depreciation.setJournalEntryId(entry.getId());
            depreciationRepository.save(depreciation);
            
            // Update asset book value
            asset.setAccumulatedDepreciation(depreciation.getCumulativeDepreciation());
            asset.setBookValue(depreciation.getBookValueAfter());
            assetRepository.save(asset);
        }
    }

    /**
     * Dispose of a fixed asset
     */
    public void disposeAsset(Long assetId, BigDecimal proceedsAmount, String disposedBy) {
        log.info("Disposing asset: {}", assetId);
        
        FixedAsset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new RuntimeException("Asset not found"));
        
        asset.setStatus(FixedAsset.AssetStatus.DISPOSED);
        asset.setDisposalDate(LocalDate.now());
        asset.setDisposalProceeds(proceedsAmount);
        
        // Calculate gain/loss = Proceeds - Book Value
        BigDecimal gainLoss = proceedsAmount.subtract(asset.getBookValue());
        asset.setGainLossOnDisposal(gainLoss);
        
        asset.setUpdatedDate(LocalDate.now());
        asset.setUpdatedBy(disposedBy);
        
        assetRepository.save(asset);
        
        // Post disposal entry to GL
        postDisposalEntry(asset);
    }

    /**
     * Post asset disposal to GL
     */
    private void postDisposalEntry(FixedAsset asset) {
        AssetCategory category = asset.getCategory();
        
        GlAccount bankAccount = glAccountService.getAccountByCode("1010");
        PostingPeriod postingPeriod = resolvePostingPeriod(bankAccount.getCompanyId(), LocalDate.now());

        JournalEntry entry = JournalEntry.builder()
            .entryNumber("JE-" + UUID.randomUUID())
            .entryDate(LocalDate.now())
            .postingDate(LocalDate.now())
            .postingPeriod(postingPeriod)
            .companyId(bankAccount.getCompanyId())
            .description("Asset disposal: " + asset.getAssetName())
            .status(JournalEntry.Status.DRAFT)
            .build();
        
        journalRepository.save(entry);
        
        // Debit cash/bank account
        JournalEntryLine cashLine = JournalEntryLine.builder()
            .journalEntry(entry)
            .glAccount(bankAccount) // Bank account
            .debitAmount(asset.getDisposalProceeds())
            .description("Disposal proceeds")
            .build();
        
        // Credit asset account
        JournalEntryLine assetLine = JournalEntryLine.builder()
            .journalEntry(entry)
            .glAccount(glAccountService.getAccountByCode(category.getAssetGlAccount()))
            .creditAmount(asset.getAcquisitionCost())
            .description("Original asset cost")
            .build();
        
        // Debit/Credit accumulated depreciation
        JournalEntryLine accumulatedLine = JournalEntryLine.builder()
            .journalEntry(entry)
            .glAccount(glAccountService.getAccountByCode(category.getDepreciationGlAccount()))
            .debitAmount(asset.getAccumulatedDepreciation())
            .description("Accumulated depreciation reversal")
            .build();
        
        lineRepository.save(cashLine);
        lineRepository.save(assetLine);
        lineRepository.save(accumulatedLine);
        
        // Post gain/loss if applicable
        if (asset.getGainLossOnDisposal().compareTo(BigDecimal.ZERO) != 0) {
            String gainLossAccount = asset.getGainLossOnDisposal().compareTo(BigDecimal.ZERO) > 0 ? "8100" : "8200";
                JournalEntryLine gainLossLine = JournalEntryLine.builder()
                    .journalEntry(entry)
                    .glAccount(glAccountService.getAccountByCode(gainLossAccount))
                    .debitAmount(asset.getGainLossOnDisposal().compareTo(BigDecimal.ZERO) < 0
                        ? asset.getGainLossOnDisposal().abs() : null)
                    .creditAmount(asset.getGainLossOnDisposal().compareTo(BigDecimal.ZERO) > 0
                        ? asset.getGainLossOnDisposal().abs() : null)
                    .description("Gain/Loss on disposal")
                    .build();
            lineRepository.save(gainLossLine);
        }
    }

            private PostingPeriod resolvePostingPeriod(UUID companyId, LocalDate entryDate) {
            Optional<PostingPeriod> period = postingPeriodRepository.findByDateInPeriod(companyId, entryDate);
            if (period.isPresent()) {
                return period.get();
            }

            PostingPeriod fallback = PostingPeriod.builder()
                .companyId(companyId)
                .periodName(YearMonth.from(entryDate).toString())
                .startDate(entryDate.withDayOfMonth(1))
                .endDate(entryDate.withDayOfMonth(entryDate.lengthOfMonth()))
                .status(PostingPeriod.Status.OPEN)
                .allowManualAdjustments(true)
                .build();

            return postingPeriodRepository.save(fallback);
            }

    /**
     * Get asset depreciation schedule
     */
    public List<FixedAssetDepreciation> getDepreciationSchedule(Long assetId) {
        return depreciationRepository.findByAssetIdOrderByDepreciationMonthDesc(assetId);
    }

    /**
     * Get asset register
     */
    public FixedAssetRegisterDto getAssetRegister() {
        List<FixedAsset> assets = assetRepository.findByStatus(FixedAsset.AssetStatus.ACTIVE);
        
        BigDecimal totalGross = BigDecimal.ZERO;
        BigDecimal totalAccumulated = BigDecimal.ZERO;
        BigDecimal totalNet = BigDecimal.ZERO;
        
        for (FixedAsset asset : assets) {
            totalGross = totalGross.add(asset.getAcquisitionCost());
            totalAccumulated = totalAccumulated.add(asset.getAccumulatedDepreciation());
            totalNet = totalNet.add(asset.getBookValue());
        }
        
        return FixedAssetRegisterDto.builder()
                .totalAssets(assets.size())
                .totalGrossCost(totalGross)
                .totalAccumulatedDepreciation(totalAccumulated)
                .totalNetBookValue(totalNet)
                .assets(assets)
                .build();
    }
}
