package com.everx.finance.period;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/periods")
@RequiredArgsConstructor
public class PeriodController {
    @GetMapping
    public List<FiscalPeriod> getAll(@RequestParam String companyCode) { return List.of(); }
}
