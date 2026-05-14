package com.everx.project.controller;

import com.everx.project.dto.*;
import com.everx.project.service.PMMilestoneService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/pm/milestones")
@RequiredArgsConstructor
public class PMMilestoneController {
    private final PMMilestoneService PMMilestoneService;

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<MilestoneDTO>> getMilestonesByProject(@PathVariable UUID projectId) {
        return ResponseEntity.ok(PMMilestoneService.getMilestonesByProject(projectId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MilestoneDTO> getMilestoneById(@PathVariable UUID id) {
        return ResponseEntity.ok(PMMilestoneService.getMilestoneById(id));
    }

    @PostMapping
    public ResponseEntity<MilestoneDTO> createMilestone(@RequestBody CreateMilestoneRequest request) {
        return ResponseEntity.ok(PMMilestoneService.createMilestone(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MilestoneDTO> updateMilestone(@PathVariable UUID id, @RequestBody UpdateMilestoneRequest request) {
        return ResponseEntity.ok(PMMilestoneService.updateMilestone(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMilestone(@PathVariable UUID id) {
        PMMilestoneService.deleteMilestone(id);
        return ResponseEntity.noContent().build();
    }
}

