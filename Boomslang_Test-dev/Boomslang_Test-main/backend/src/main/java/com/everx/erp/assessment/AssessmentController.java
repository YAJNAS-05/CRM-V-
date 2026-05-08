package com.everx.erp.assessment;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/assessments")
@RequiredArgsConstructor
public class AssessmentController {
    @GetMapping
    public List<AssetAssessment> getAll() { return List.of(); }
}
