package com.everx.crm.leadscore;

import com.everx.crm.lead.Lead;
import com.everx.crm.lead.LeadRepository;
import com.everx.crm.leadscore.dto.LeadScoreDto;
import com.everx.shared.exception.EntityNotFoundException;
import com.everx.shared.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class LeadScoringService {

    private static final Map<String, Integer> SCORE_MAP = Map.of(
            "EMAIL_ENGAGEMENT", 2,
            "PHONE_CALL", 5,
            "QUOTE_SENT", 10,
            "MEETING_SCHEDULED", 8,
            "SITE_VISIT", 12
    );

    private final LeadScoreRepository leadScoreRepository;
    private final LeadRepository leadRepository;

    public LeadScoreDto recordActivity(UUID leadId, String activityType) {
        Integer points = SCORE_MAP.get(activityType);
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

        Integer totalScore = leadScoreRepository.sumPointsByLeadId(leadId);
        if (totalScore != null && totalScore >= 70 && !"QUALIFIED".equalsIgnoreCase(lead.getStatus())) {
            lead.setStatus("QUALIFIED");
            leadRepository.save(lead);
        }

        return LeadScoreDto.fromEntity(saved);
    }
}
