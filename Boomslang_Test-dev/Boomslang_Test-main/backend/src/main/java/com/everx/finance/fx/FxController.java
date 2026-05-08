package com.everx.finance.fx;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/fx")
@RequiredArgsConstructor
public class FxController {
    @GetMapping("/positions")
    public List<FxPosition> getPositions(@RequestParam String companyCode) { return List.of(); }
    @PostMapping("/convert")
    public FxConversionResult convert(@RequestParam String from, @RequestParam String to, @RequestParam java.math.BigDecimal amount) { return null; }
}
