package com.everx.project.controller;

import com.everx.project.dto.*;
import com.everx.project.service.PMSprintService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/pm/sprints")
@RequiredArgsConstructor
public class PMSprintController {
    private final PMSprintService PMSprintService;

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<SprintDTO>> getSprintsByProject(@PathVariable UUID projectId) {
        return ResponseEntity.ok(PMSprintService.getSprintsByProject(projectId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SprintDTO> getSprintById(@PathVariable UUID id) {
        return ResponseEntity.ok(PMSprintService.getSprintById(id));
    }

    @GetMapping("/project/{projectId}/active")
    public ResponseEntity<SprintDTO> getActiveSprint(@PathVariable UUID projectId) {
        SprintDTO sprint = PMSprintService.getActiveSprint(projectId);
        if (sprint == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(sprint);
    }

    @PostMapping
    public ResponseEntity<SprintDTO> createSprint(@RequestBody CreateSprintRequest request) {
        return ResponseEntity.ok(PMSprintService.createSprint(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SprintDTO> updateSprint(@PathVariable UUID id, @RequestBody UpdateSprintRequest request) {
        return ResponseEntity.ok(PMSprintService.updateSprint(id, request));
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<SprintDTO> startSprint(@PathVariable UUID id) {
        return ResponseEntity.ok(PMSprintService.startSprint(id));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<SprintDTO> completeSprint(@PathVariable UUID id) {
        return ResponseEntity.ok(PMSprintService.completeSprint(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSprint(@PathVariable UUID id) {
        PMSprintService.deleteSprint(id);
        return ResponseEntity.noContent().build();
    }
}

