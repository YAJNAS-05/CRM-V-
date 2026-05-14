package com.everx.crm.leadscore;

import com.everx.crm.leadscore.dto.LeadScoreDto;
import com.everx.crm.leadscore.dto.RecordLeadScoreRequest;
import com.everx.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/crm/leads")
@RequiredArgsConstructor
public class LeadScoreController {

    private final LeadScoringService leadScoringService;

    @PostMapping("/{leadId}/scores")
    public ResponseEntity<ApiResponse<LeadScoreDto>> recordScore(
            @PathVariable UUID leadId,
            @Valid @RequestBody RecordLeadScoreRequest request) {
        LeadScoreDto score = leadScoringService.recordActivity(leadId, request.getActivityType());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(score, "Lead score recorded"));
    }
}
