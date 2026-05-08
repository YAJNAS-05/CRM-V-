package com.everx.erp.inventory;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
public class InventoryController {
    @GetMapping
    public List<InventoryItem> getAll() { return List.of(); }
}
