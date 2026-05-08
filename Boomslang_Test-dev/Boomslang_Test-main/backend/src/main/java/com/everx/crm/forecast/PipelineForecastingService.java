package com.everx.crm.forecast;

import com.everx.crm.deal.Deal;
import com.everx.crm.deal.DealRepository;
import com.everx.crm.forecast.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PipelineForecastingService {

    private final DealRepository dealRepository;

    // Standard stage probabilities for forecasting
    private static final Map<String, Integer> STAGE_PROBABILITIES = Map.of(
        "PROSPECTING", 10,
        "QUALIFICATION", 25,
        "NEEDS_ANALYSIS", 40,
        "VALUE_PROPOSITION", 50,
        "ID_DECISION_MAKERS", 60,
        "PERCEPTION_ANALYSIS", 70,
        "PROPOSAL", 75,
        "NEGOTIATION", 90,
        "CLOSED_WON", 100,
        "CLOSED_LOST", 0
    );

    /**
     * Get comprehensive pipeline forecast
     */
    public PipelineForecastDto getPipelineForecast(UUID ownerId, LocalDate startDate, LocalDate endDate) {
        List<Deal> deals = ownerId != null 
            ? dealRepository.findByOwnerIdAndNotClosed(ownerId)
            : dealRepository.findAllActiveOpen();

        // Filter by expected close date if provided
        if (startDate != null || endDate != null) {
            deals = deals.stream()
                .filter(d -> {
                    if (d.getExpectedCloseDate() == null) return true;
                    LocalDate closeDate = d.getExpectedCloseDate();
                    boolean afterStart = startDate == null || !closeDate.isBefore(startDate);
                    boolean beforeEnd = endDate == null || !closeDate.isAfter(endDate);
                    return afterStart && beforeEnd;
                })
                .collect(Collectors.toList());
        }

        return PipelineForecastDto.builder()
            .summary(calculateSummary(deals))
            .byStage(calculateByStage(deals))
            .byMonth(calculateByMonth(deals))
            .byQuarter(calculateByQuarter(deals))
            .trend(analyzeTrend(deals))
            .healthScore(calculateHealthScore(deals))
            .recommendations(generateRecommendations(deals))
            .build();
    }

    /**
     * Get sales velocity metrics
     */
    public SalesVelocityDto getSalesVelocity(UUID ownerId, int monthsBack) {
        LocalDate since = LocalDate.now().minusMonths(monthsBack);
        List<Deal> wonDeals = ownerId != null
            ? dealRepository.findWonByOwnerSince(ownerId, since)
            : dealRepository.findWonSince(since);

        if (wonDeals.isEmpty()) {
            return SalesVelocityDto.builder()
                .averageDaysToClose(0)
                .averageDealSize(BigDecimal.ZERO)
                .winRate(0.0)
                .opportunitiesCreated(0)
                .revenueVelocity(BigDecimal.ZERO)
                .build();
        }

        int totalDays = wonDeals.stream()
            .mapToInt(d -> d.getDaysInPipeline() != null ? d.getDaysInPipeline() : 0)
            .sum();

        BigDecimal totalValue = wonDeals.stream()
            .map(d -> d.getAmount() != null ? d.getAmount() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal avgDealSize = totalValue.divide(
            BigDecimal.valueOf(wonDeals.size()), 2, RoundingMode.HALF_UP);

        // Calculate win rate
        List<Deal> allDeals = ownerId != null
            ? dealRepository.findCreatedByOwnerSince(ownerId, since)
            : dealRepository.findCreatedSince(since);
        
        long totalOpportunities = allDeals.size();
        double winRate = totalOpportunities > 0 
            ? (double) wonDeals.size() / totalOpportunities * 100 
            : 0.0;

        // Revenue velocity = # of deals × avg deal size × win rate / avg sales cycle
        BigDecimal revenueVelocity = avgDealSize
            .multiply(BigDecimal.valueOf(wonDeals.size()))
            .multiply(BigDecimal.valueOf(winRate / 100))
            .divide(BigDecimal.valueOf(Math.max(totalDays / wonDeals.size(), 1)), 2, RoundingMode.HALF_UP);

        return SalesVelocityDto.builder()
            .averageDaysToClose(totalDays / wonDeals.size())
            .averageDealSize(avgDealSize)
            .winRate(Math.round(winRate * 100.0) / 100.0)
            .opportunitiesCreated((int) totalOpportunities)
            .revenueVelocity(revenueVelocity)
            .build();
    }

    /**
     * Calculate forecast summary
     */
    private ForecastSummaryDto calculateSummary(List<Deal> deals) {
        BigDecimal totalPipeline = deals.stream()
            .map(d -> d.getAmount() != null ? d.getAmount() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal weightedForecast = deals.stream()
            .map(d -> calculateWeightedValue(d))
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal bestCase = deals.stream()
            .filter(d -> !isClosedStage(d.getStage()))
            .map(d -> d.getAmount() != null ? d.getAmount() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal commit = weightedForecast.multiply(BigDecimal.valueOf(0.8))
            .setScale(2, RoundingMode.HALF_UP);

        long dealCount = deals.stream()
            .filter(d -> !isClosedStage(d.getStage()))
            .count();

        return ForecastSummaryDto.builder()
            .totalPipelineValue(totalPipeline)
            .weightedForecast(weightedForecast)
            .bestCaseForecast(bestCase)
            .commitForecast(commit)
            .openDealCount((int) dealCount)
            .build();
    }

    /**
     * Calculate forecast by stage
     */
    private List<StageForecastDto> calculateByStage(List<Deal> deals) {
        Map<String, List<Deal>> byStage = deals.stream()
            .filter(d -> !isClosedStage(d.getStage()))
            .collect(Collectors.groupingBy(Deal::getStage));

        return byStage.entrySet().stream()
            .map(entry -> {
                String stage = entry.getKey();
                List<Deal> stageDeals = entry.getValue();
                
                BigDecimal stageValue = stageDeals.stream()
                    .map(d -> d.getAmount() != null ? d.getAmount() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

                BigDecimal weightedValue = stageDeals.stream()
                    .map(this::calculateWeightedValue)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

                Integer probability = STAGE_PROBABILITIES.getOrDefault(stage.toUpperCase(), 50);
                
                // Calculate average days in stage
                double avgDays = stageDeals.stream()
                    .mapToInt(d -> d.getDaysInStage() != null ? d.getDaysInStage() : 0)
                    .average()
                    .orElse(0.0);

                return StageForecastDto.builder()
                    .stage(stage)
                    .dealCount(stageDeals.size())
                    .totalValue(stageValue)
                    .weightedValue(weightedValue)
                    .probability(probability)
                    .averageDaysInStage((int) avgDays)
                    .build();
            })
            .sorted(Comparator.comparingInt(s -> 
                STAGE_PROBABILITIES.getOrDefault(s.getStage().toUpperCase(), 50)))
            .collect(Collectors.toList());
    }

    /**
     * Calculate forecast by month
     */
    private List<MonthlyForecastDto> calculateByMonth(List<Deal> deals) {
        Map<YearMonth, List<Deal>> byMonth = deals.stream()
            .filter(d -> d.getExpectedCloseDate() != null)
            .collect(Collectors.groupingBy(d -> YearMonth.from(d.getExpectedCloseDate())));

        return byMonth.entrySet().stream()
            .map(entry -> {
                YearMonth month = entry.getKey();
                List<Deal> monthDeals = entry.getValue();

                BigDecimal totalValue = monthDeals.stream()
                    .map(d -> d.getAmount() != null ? d.getAmount() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

                BigDecimal weightedValue = monthDeals.stream()
                    .map(this::calculateWeightedValue)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

                return MonthlyForecastDto.builder()
                    .yearMonth(month.toString())
                    .dealCount(monthDeals.size())
                    .totalValue(totalValue)
                    .weightedValue(weightedValue)
                    .build();
            })
            .sorted(Comparator.comparing(MonthlyForecastDto::getYearMonth))
            .collect(Collectors.toList());
    }

    /**
     * Calculate forecast by quarter
     */
    private List<QuarterlyForecastDto> calculateByQuarter(List<Deal> deals) {
        Map<String, List<Deal>> byQuarter = deals.stream()
            .filter(d -> d.getExpectedCloseDate() != null)
            .collect(Collectors.groupingBy(d -> {
                LocalDate date = d.getExpectedCloseDate();
                int quarter = (date.getMonthValue() - 1) / 3 + 1;
                return date.getYear() + "-Q" + quarter;
            }));

        return byQuarter.entrySet().stream()
            .map(entry -> {
                String quarter = entry.getKey();
                List<Deal> quarterDeals = entry.getValue();

                BigDecimal totalValue = quarterDeals.stream()
                    .map(d -> d.getAmount() != null ? d.getAmount() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

                BigDecimal weightedValue = quarterDeals.stream()
                    .map(this::calculateWeightedValue)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

                return QuarterlyForecastDto.builder()
                    .quarter(quarter)
                    .dealCount(quarterDeals.size())
                    .totalValue(totalValue)
                    .weightedValue(weightedValue)
                    .build();
            })
            .sorted(Comparator.comparing(QuarterlyForecastDto::getQuarter))
            .collect(Collectors.toList());
    }

    /**
     * Analyze pipeline trend
     */
    private PipelineTrendDto analyzeTrend(List<Deal> deals) {
        // Compare current month vs previous month
        YearMonth currentMonth = YearMonth.now();
        YearMonth previousMonth = currentMonth.minusMonths(1);

        BigDecimal currentValue = deals.stream()
            .filter(d -> d.getExpectedCloseDate() != null)
            .filter(d -> YearMonth.from(d.getExpectedCloseDate()).equals(currentMonth))
            .map(d -> d.getAmount() != null ? d.getAmount() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal previousValue = deals.stream()
            .filter(d -> d.getExpectedCloseDate() != null)
            .filter(d -> YearMonth.from(d.getExpectedCloseDate()).equals(previousMonth))
            .map(d -> d.getAmount() != null ? d.getAmount() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal change = currentValue.subtract(previousValue);
        double changePercent = previousValue.compareTo(BigDecimal.ZERO) > 0
            ? change.divide(previousValue, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue()
            : 0.0;

        String trend = change.compareTo(BigDecimal.ZERO) > 0 ? "UP" 
            : change.compareTo(BigDecimal.ZERO) < 0 ? "DOWN" : "FLAT";

        return PipelineTrendDto.builder()
            .trendDirection(trend)
            .monthOverMonthChange(change)
            .monthOverMonthChangePercent(Math.round(changePercent * 100.0) / 100.0)
            .build();
    }

    /**
     * Calculate pipeline health score (0-100)
     */
    private int calculateHealthScore(List<Deal> deals) {
        if (deals.isEmpty()) return 0;

        int score = 50; // Base score

        // Factor 1: Deal distribution across stages
        long lateStageDeals = deals.stream()
            .filter(d -> {
                String stage = d.getStage();
                return stage != null && (
                    stage.contains("PROPOSAL") || 
                    stage.contains("NEGOTIATION") || 
                    stage.contains("CLOSED_WON")
                );
            })
            .count();
        
        if (lateStageDeals > 0) {
            double lateStageRatio = (double) lateStageDeals / deals.size();
            score += (int) (lateStageRatio * 20); // Up to +20 points
        }

        // Factor 2: Average deal age (penalize old deals)
        double avgDays = deals.stream()
            .mapToInt(d -> d.getDaysInPipeline() != null ? d.getDaysInPipeline() : 0)
            .average()
            .orElse(0.0);
        
        if (avgDays > 90) {
            score -= 15; // Penalty for old pipeline
        } else if (avgDays < 30) {
            score += 10; // Bonus for fresh pipeline
        }

        // Factor 3: Data quality (deals with amounts)
        long dealsWithAmount = deals.stream()
            .filter(d -> d.getAmount() != null && d.getAmount().compareTo(BigDecimal.ZERO) > 0)
            .count();
        
        if (dealsWithAmount > 0) {
            double dataQualityRatio = (double) dealsWithAmount / deals.size();
            score += (int) (dataQualityRatio * 15); // Up to +15 points
        }

        // Factor 4: Close date proximity
        LocalDate now = LocalDate.now();
        long dealsClosingSoon = deals.stream()
            .filter(d -> d.getExpectedCloseDate() != null)
            .filter(d -> {
                long daysUntilClose = ChronoUnit.DAYS.between(now, d.getExpectedCloseDate());
                return daysUntilClose >= 0 && daysUntilClose <= 30;
            })
            .count();
        
        if (dealsClosingSoon > 0) {
            score += 10; // Bonus for deals closing soon
        }

        return Math.max(0, Math.min(100, score));
    }

    /**
     * Generate recommendations based on pipeline analysis
     */
    private List<String> generateRecommendations(List<Deal> deals) {
        List<String> recommendations = new ArrayList<>();

        // Check for deals stuck in early stages
        long earlyStageOldDeals = deals.stream()
            .filter(d -> {
                String stage = d.getStage();
                return stage != null && (
                    stage.contains("PROSPECTING") || 
                    stage.contains("QUALIFICATION")
                ) && d.getDaysInStage() != null && d.getDaysInStage() > 30;
            })
            .count();
        
        if (earlyStageOldDeals > 0) {
            recommendations.add(earlyStageOldDeals + " deals stuck in early stages for over 30 days. Consider qualification review.");
        }

        // Check for deals without expected close dates
        long dealsWithoutCloseDate = deals.stream()
            .filter(d -> d.getExpectedCloseDate() == null)
            .count();
        
        if (dealsWithoutCloseDate > 0) {
            recommendations.add(dealsWithoutCloseDate + " deals missing expected close dates. Update for accurate forecasting.");
        }

        // Check for deals without amounts
        long dealsWithoutAmount = deals.stream()
            .filter(d -> d.getAmount() == null || d.getAmount().compareTo(BigDecimal.ZERO) == 0)
            .count();
        
        if (dealsWithoutAmount > 0) {
            recommendations.add(dealsWithoutAmount + " deals missing value estimates. Update for pipeline visibility.");
        }

        // Check for aging deals
        long agingDeals = deals.stream()
            .filter(d -> d.getDaysInPipeline() != null && d.getDaysInPipeline() > 90)
            .count();
        
        if (agingDeals > 0) {
            recommendations.add(agingDeals + " deals in pipeline over 90 days. Review for closure or advancement.");
        }

        if (recommendations.isEmpty()) {
            recommendations.add("Pipeline looks healthy. Continue current sales activities.");
        }

        return recommendations;
    }

    /**
     * Calculate weighted value for a deal
     */
    private BigDecimal calculateWeightedValue(Deal deal) {
        BigDecimal amount = deal.getAmount() != null ? deal.getAmount() : BigDecimal.ZERO;
        
        // Use deal's probability if set, otherwise use stage-based probability
        Integer probability = deal.getProbability();
        if (probability == null || probability == 0) {
            probability = STAGE_PROBABILITIES.getOrDefault(
                deal.getStage() != null ? deal.getStage().toUpperCase() : "", 50);
        }
        
        return amount.multiply(BigDecimal.valueOf(probability))
            .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
    }

    /**
     * Check if stage is a closed stage
     */
    private boolean isClosedStage(String stage) {
        if (stage == null) return false;
        String upperStage = stage.toUpperCase();
        return upperStage.contains("CLOSED") || upperStage.contains("WON") || upperStage.contains("LOST");
    }
}
