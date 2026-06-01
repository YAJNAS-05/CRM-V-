package com.everx.finance.controller;

import com.everx.finance.entity.AssetCategory;
import com.everx.finance.service.AssetCategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/finance/asset-categories")
@RequiredArgsConstructor
@Slf4j
public class AssetCategoryController {
    private final AssetCategoryService assetCategoryService;

    @PostMapping
    public ResponseEntity<AssetCategory> createCategory(@RequestBody AssetCategory category) {
        log.info("Creating asset category: {}", category.getCategoryCode());
        AssetCategory created = assetCategoryService.createCategory(category, "system");
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<AssetCategory>> getAllCategories() {
        log.info("Getting all asset categories");
        List<AssetCategory> categories = assetCategoryService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/{code}")
    public ResponseEntity<AssetCategory> getCategoryByCode(@PathVariable String code) {
        log.info("Getting asset category: {}", code);
        AssetCategory category = assetCategoryService.getCategoryByCode(code);
        return ResponseEntity.ok(category);
    }
}
