package com.everx.erp.service;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/service-orders")
@RequiredArgsConstructor
public class ServiceController {
    @GetMapping
    public List<ServiceOrder> getAll() { return List.of(); }
}
