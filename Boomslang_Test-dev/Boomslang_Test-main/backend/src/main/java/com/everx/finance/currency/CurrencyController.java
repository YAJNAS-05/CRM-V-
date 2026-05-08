package com.everx.finance.currency;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/currency")
@RequiredArgsConstructor
public class CurrencyController {
    @GetMapping
    public List<Currency> getAll() { return List.of(); }
    @GetMapping("/{code}")
    public Currency getByCode(@PathVariable String code) { return null; }
}
