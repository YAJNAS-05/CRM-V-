package com.everx.finance.journal;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/journal")
@RequiredArgsConstructor
public class JournalController {
    @GetMapping
    public List<JournalEntry> getAll(@RequestParam String companyCode) { return List.of(); }
}
