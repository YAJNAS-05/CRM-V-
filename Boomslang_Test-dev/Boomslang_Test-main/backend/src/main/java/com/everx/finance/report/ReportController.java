package com.everx.finance.report;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {
    @GetMapping
    public List<FinancialReport> getAll(@RequestParam String companyCode) { return List.of(); }
}
