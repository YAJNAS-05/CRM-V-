package com.everx.hr.pm.sprint;

import com.everx.hr.pm.sprint.dto.CreateSprintRequest;
import com.everx.hr.pm.sprint.dto.SprintDto;
import com.everx.hr.pm.sprint.dto.UpdateSprintRequest;
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
@RequestMapping("/api/v1/pm/sprints")
@RequiredArgsConstructor
public class SprintController {

    private final SprintService sprintService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<SprintDto>>> getSprints(
            @RequestParam UUID projectId,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(sprintService.getSprints(projectId, pageable)));
    }

    @GetMapping("/{sprintId}")
    public ResponseEntity<ApiResponse<SprintDto>> getSprint(@PathVariable UUID sprintId) {
        return ResponseEntity.ok(ApiResponse.ok(sprintService.getSprint(sprintId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SprintDto>> createSprint(@Valid @RequestBody CreateSprintRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(sprintService.createSprint(request), "Sprint created"));
    }

    @PutMapping("/{sprintId}")
    public ResponseEntity<ApiResponse<SprintDto>> updateSprint(
            @PathVariable UUID sprintId,
            @RequestBody UpdateSprintRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(sprintService.updateSprint(sprintId, request), "Sprint updated"));
    }

    @DeleteMapping("/{sprintId}")
    public ResponseEntity<ApiResponse<Void>> deleteSprint(@PathVariable UUID sprintId) {
        sprintService.deleteSprint(sprintId);
        return ResponseEntity.ok(ApiResponse.okMessage("Sprint deleted"));
    }
}
