package com.everx.erp.acquisition;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/acquisitions")
@RequiredArgsConstructor
public class AcquisitionController {
    @GetMapping
    public List<Acquisition> getAll() { return List.of(); }
}
