package com.everx.hr.pm.milestone;

import com.everx.hr.pm.milestone.dto.CreateMilestoneRequest;
import com.everx.hr.pm.milestone.dto.MilestoneDto;
import com.everx.hr.pm.milestone.dto.UpdateMilestoneRequest;
import com.everx.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/pm/milestones")
@RequiredArgsConstructor
public class MilestoneController {

    private final MilestoneService milestoneService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<MilestoneDto>>> getMilestones(
            @RequestParam UUID projectId,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(milestoneService.getMilestones(projectId, pageable)));
    }

    @GetMapping("/{milestoneId}")
    public ResponseEntity<ApiResponse<MilestoneDto>> getMilestone(@PathVariable UUID milestoneId) {
        return ResponseEntity.ok(ApiResponse.ok(milestoneService.getMilestone(milestoneId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MilestoneDto>> createMilestone(@Valid @RequestBody CreateMilestoneRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(milestoneService.createMilestone(request), "Milestone created"));
    }

    @PutMapping("/{milestoneId}")
    public ResponseEntity<ApiResponse<MilestoneDto>> updateMilestone(
            @PathVariable UUID milestoneId,
            @RequestBody UpdateMilestoneRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(milestoneService.updateMilestone(milestoneId, request), "Milestone updated"));
    }

    @DeleteMapping("/{milestoneId}")
    public ResponseEntity<ApiResponse<Void>> deleteMilestone(@PathVariable UUID milestoneId) {
        milestoneService.deleteMilestone(milestoneId);
        return ResponseEntity.ok(ApiResponse.okMessage("Milestone deleted"));
    }
}
