package com.everx.insights;

import com.everx.insights.dto.MyInsightsResponse;
import com.everx.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/me")
@RequiredArgsConstructor
public class MyInsightsController {

    private final MyInsightsService insightsService;

    @GetMapping("/insights")
    @PreAuthorize("hasAuthority('INSIGHTS_VIEW')")
    public ResponseEntity<ApiResponse<MyInsightsResponse>> getInsights() {
        return ResponseEntity.ok(ApiResponse.ok(insightsService.getMyInsights(), "Insights retrieved"));
    }
}
