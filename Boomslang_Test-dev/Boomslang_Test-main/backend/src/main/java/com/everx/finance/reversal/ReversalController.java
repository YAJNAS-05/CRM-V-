package com.everx.finance.reversal;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/reversal")
@RequiredArgsConstructor
public class ReversalController {
    @PostMapping("/{entryId}")
    public JournalReversal reverse(@PathVariable java.util.UUID entryId, @RequestBody ReversalRequest request) { return null; }
}

class ReversalRequest {
    private String reason;
    private java.util.UUID reversedBy;
}
