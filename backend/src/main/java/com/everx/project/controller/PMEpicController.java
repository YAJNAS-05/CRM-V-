package com.everx.project.controller;

import com.everx.project.dto.*;
import com.everx.project.service.PMEpicService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/pm/epics")
@RequiredArgsConstructor
public class PMEpicController {
    private final PMEpicService PMEpicService;

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<EpicDTO>> getEpicsByProject(@PathVariable UUID projectId) {
        return ResponseEntity.ok(PMEpicService.getEpicsByProject(projectId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EpicDTO> getEpicById(@PathVariable UUID id) {
        return ResponseEntity.ok(PMEpicService.getEpicById(id));
    }

    @PostMapping
    public ResponseEntity<EpicDTO> createEpic(@RequestBody CreateEpicRequest request) {
        return ResponseEntity.ok(PMEpicService.createEpic(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EpicDTO> updateEpic(@PathVariable UUID id, @RequestBody UpdateEpicRequest request) {
        return ResponseEntity.ok(PMEpicService.updateEpic(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEpic(@PathVariable UUID id) {
        PMEpicService.deleteEpic(id);
        return ResponseEntity.noContent().build();
    }
}

