package com.everx.crm.leadscore;

import com.everx.crm.lead.Lead;
import com.everx.crm.lead.LeadRepository;
import com.everx.crm.leadscore.dto.LeadScoreCalculationDto;
import com.everx.crm.leadscore.dto.LeadScoreDto;
import com.everx.shared.exception.EntityNotFoundException;
import com.everx.shared.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class LeadScoringService {

    // Activity-based scoring
    private static final Map<String, Integer> ACTIVITY_SCORE_MAP = Map.of(
            "EMAIL_ENGAGEMENT", 2,
            "PHONE_CALL", 5,
            "QUOTE_SENT", 10,
            "MEETING_SCHEDULED", 8,
            "SITE_VISIT", 12,
            "DEMO_REQUESTED", 15,
            "PROPOSAL_SENT", 20,
            "EMAIL_OPENED", 1,
            "LINK_CLICKED", 3,
            "WEBINAR_ATTENDED", 7,
            "WHITEPAPER_DOWNLOAD", 5,
            "TRIAL_SIGNUP", 10
    );

    // Demographic scoring criteria
    private static final Set<String> HIGH_VALUE_TITLES = Set.of(
            "CEO", "CTO", "CFO", "COO", "VP", "VICE PRESIDENT",
            "DIRECTOR", "MANAGER", "HEAD", "CHIEF", "OWNER", "FOUNDER"
    );

    private static final Set<String> HIGH_VALUE_INDUSTRIES = Set.of(
            "HEALTHCARE", "TECHNOLOGY", "FINANCE", "BANKING",
            "PHARMACEUTICAL", "MANUFACTURING", "ENERGY"
    );

    private final LeadScoreRepository leadScoreRepository;
    private final LeadRepository leadRepository;

    public LeadScoreDto recordActivity(UUID leadId, String activityType) {
        Integer points = ACTIVITY_SCORE_MAP.get(activityType);
        if (points == null) {
            throw new ValidationException("Unknown lead score activity type: " + activityType);
        }

        Lead lead = leadRepository.findByIdActive(leadId)
                .orElseThrow(() -> new EntityNotFoundException("Lead not found with id: " + leadId));

        LeadScore score = new LeadScore();
        score.setLeadId(leadId);
        score.setScoreType(activityType);
        score.setPoints(points);
        LeadScore saved = leadScoreRepository.save(score);

        // Auto-qualify based on cumulative score
        Integer totalScore = leadScoreRepository.sumPointsByLeadId(leadId);
        Integer predictiveScore = calculatePredictiveScore(lead);
        int combinedScore = (totalScore != null ? totalScore : 0) + predictiveScore;

        if (combinedScore >= 75 && !"QUALIFIED".equalsIgnoreCase(lead.getStatus())) {
            lead.setStatus("QUALIFIED");
            leadRepository.save(lead);
        }

        return LeadScoreDto.fromEntity(saved);
    }

    /**
     * Calculate predictive score based on lead demographics and firmographics
     */
    public Integer calculatePredictiveScore(Lead lead) {
        int score = 0;

        // Job Title Scoring (0-20 points)
        if (lead.getJobTitle() != null) {
            String title = lead.getJobTitle().toUpperCase();
            if (title.contains("C-LEVEL") || title.contains("CEO") || title.contains("CTO") || title.contains("CFO")) {
                score += 20;
            } else if (title.contains("VP") || title.contains("VICE PRESIDENT")) {
                score += 15;
            } else if (title.contains("DIRECTOR")) {
                score += 12;
            } else if (title.contains("MANAGER")) {
                score += 8;
            } else {
                score += 3;
            }
        }

        // Company Size Scoring (0-15 points)
        if (lead.getEmployees() != null) {
            int employees = lead.getEmployees();
            if (employees >= 1000) {
                score += 15;
            } else if (employees >= 500) {
                score += 12;
            } else if (employees >= 100) {
                score += 9;
            } else if (employees >= 50) {
                score += 6;
            } else if (employees >= 10) {
                score += 3;
            }
        }

        // Annual Revenue Scoring (0-15 points)
        if (lead.getAnnualRevenue() != null) {
            BigDecimal revenue = lead.getAnnualRevenue();
            if (revenue.compareTo(new BigDecimal("100000000")) >= 0) { // $100M+
                score += 15;
            } else if (revenue.compareTo(new BigDecimal("50000000")) >= 0) { // $50M+
                score += 12;
            } else if (revenue.compareTo(new BigDecimal("10000000")) >= 0) { // $10M+
                score += 9;
            } else if (revenue.compareTo(new BigDecimal("1000000")) >= 0) { // $1M+
                score += 6;
            } else {
                score += 3;
            }
        }

        // Lead Source Scoring (0-10 points)
        if (lead.getLeadSource() != null) {
            String source = lead.getLeadSource().toUpperCase();
            if (source.contains("REFERRAL")) {
                score += 10;
            } else if (source.contains("WEBSITE") || source.contains("ORGANIC")) {
                score += 8;
            } else if (source.contains("WEBINAR")) {
                score += 7;
            } else if (source.contains("EMAIL")) {
                score += 5;
            } else if (source.contains("SOCIAL")) {
                score += 4;
            } else if (source.contains("PAID")) {
                score += 3;
            } else {
                score += 2;
            }
        }

        // Data Completeness Scoring (0-10 points)
        int completenessPoints = 0;
        if (lead.getEmail() != null && !lead.getEmail().isEmpty()) completenessPoints += 2;
        if (lead.getPhone() != null && !lead.getPhone().isEmpty()) completenessPoints += 2;
        if (lead.getCompany() != null && !lead.getCompany().isEmpty()) completenessPoints += 2;
        if (lead.getJobTitle() != null && !lead.getJobTitle().isEmpty()) completenessPoints += 2;
        if (lead.getCountry() != null && !lead.getCountry().isEmpty()) completenessPoints += 2;
        score += completenessPoints;

        return score;
    }

    /**
     * Get complete lead score calculation including activity and predictive scores
     */
    @Transactional(readOnly = true)
    public LeadScoreCalculationDto getLeadScoreCalculation(UUID leadId) {
        Lead lead = leadRepository.findByIdActive(leadId)
                .orElseThrow(() -> new EntityNotFoundException("Lead not found with id: " + leadId));

        Integer activityScore = leadScoreRepository.sumPointsByLeadId(leadId);
        Integer predictiveScore = calculatePredictiveScore(lead);

        int totalScore = (activityScore != null ? activityScore : 0) + predictiveScore;

        return LeadScoreCalculationDto.builder()
                .leadId(leadId)
                .activityScore(activityScore != null ? activityScore : 0)
                .predictiveScore(predictiveScore)
                .totalScore(totalScore)
                .grade(calculateGrade(totalScore))
                .qualificationStatus(determineQualificationStatus(totalScore, lead.getStatus()))
                .nextBestAction(recommendNextAction(totalScore, lead.getStatus()))
                .build();
    }

    /**
     * Calculate grade based on total score
     */
    private String calculateGrade(int totalScore) {
        if (totalScore >= 85) return "A";
        if (totalScore >= 70) return "B";
        if (totalScore >= 50) return "C";
        if (totalScore >= 30) return "D";
        return "F";
    }

    /**
     * Determine qualification status based on score
     */
    private String determineQualificationStatus(int totalScore, String currentStatus) {
        if (totalScore >= 75) return "HOT";
        if (totalScore >= 50) return "WARM";
        if (totalScore >= 25) return "COLD";
        return "UNQUALIFIED";
    }

    /**
     * Recommend next best action based on score and status
     */
    private String recommendNextAction(int totalScore, String status) {
        if ("CONVERTED".equalsIgnoreCase(status)) {
            return "Nurture as customer";
        }
        if (totalScore >= 75) {
            return "Immediate outreach - high conversion probability";
        }
        if (totalScore >= 50) {
            return "Schedule demo or meeting";
        }
        if (totalScore >= 30) {
            return "Send educational content and nurture";
        }
        return "Enrich data or deprioritize";
    }
}
