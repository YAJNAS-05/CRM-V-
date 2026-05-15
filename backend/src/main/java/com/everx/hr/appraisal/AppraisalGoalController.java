package com.everx.hr.appraisal;

import com.everx.hr.appraisal.dto.AppraisalGoalDto;
import com.everx.hr.appraisal.dto.CreateAppraisalGoalRequest;
import com.everx.hr.appraisal.dto.UpdateAppraisalGoalRequest;
import com.everx.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/hr/appraisal/goals")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('HR_VIEW')")
public class AppraisalGoalController {

    private final AppraisalGoalService appraisalGoalService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AppraisalGoalDto>>> getGoals(
            @RequestParam(required = false) UUID ownerId,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(appraisalGoalService.getGoals(ownerId, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AppraisalGoalDto>> getGoal(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(appraisalGoalService.getGoal(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AppraisalGoalDto>> createGoal(@Valid @RequestBody CreateAppraisalGoalRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(appraisalGoalService.createGoal(request), "Appraisal goal created"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AppraisalGoalDto>> updateGoal(
            @PathVariable UUID id,
            @RequestBody UpdateAppraisalGoalRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(appraisalGoalService.updateGoal(id, request), "Appraisal goal updated"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteGoal(@PathVariable UUID id) {
        appraisalGoalService.deleteGoal(id);
        return ResponseEntity.ok(ApiResponse.okMessage("Appraisal goal deleted"));
    }
}
