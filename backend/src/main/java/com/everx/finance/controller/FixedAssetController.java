package com.everx.finance.controller;

import com.everx.finance.entity.FixedAsset;
import com.everx.finance.entity.FixedAssetDepreciation;
import com.everx.finance.service.FixedAssetService;
import com.everx.finance.dto.FixedAssetRegisterDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.YearMonth;
import java.util.List;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/finance/fixed-assets")
@RequiredArgsConstructor
@Slf4j
public class FixedAssetController {
    private final FixedAssetService fixedAssetService;

    @PostMapping
    public ResponseEntity<FixedAsset> createAsset(@RequestBody FixedAsset asset) {
        log.info("Creating fixed asset: {}", asset.getAssetCode());
        FixedAsset created = fixedAssetService.createAsset(asset, "system");
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/register")
    public ResponseEntity<FixedAssetRegisterDto> getAssetRegister() {
        log.info("Getting asset register");
        FixedAssetRegisterDto register = fixedAssetService.getAssetRegister();
        return ResponseEntity.ok(register);
    }

    @PostMapping("/depreciation/calculate")
    public ResponseEntity<List<FixedAssetDepreciation>> calculateDepreciation(
            @RequestParam String month) {
        log.info("Calculating depreciation for month: {}", month);
        YearMonth yearMonth = YearMonth.parse(month);
        List<FixedAssetDepreciation> depreciation = fixedAssetService.calculateMonthlyDepreciation(yearMonth);
        return ResponseEntity.ok(depreciation);
    }

    @PostMapping("/depreciation/post")
    public ResponseEntity<String> postDepreciationToGl(@RequestParam String month) {
        log.info("Posting depreciation to GL for month: {}", month);
        YearMonth yearMonth = YearMonth.parse(month);
        fixedAssetService.postDepreciationToGl(yearMonth, "system");
        return ResponseEntity.ok("Depreciation posted successfully");
    }

    @GetMapping("/{id}/schedule")
    public ResponseEntity<List<FixedAssetDepreciation>> getDepreciationSchedule(@PathVariable Long id) {
        log.info("Getting depreciation schedule for asset: {}", id);
        List<FixedAssetDepreciation> schedule = fixedAssetService.getDepreciationSchedule(id);
        return ResponseEntity.ok(schedule);
    }

    @PostMapping("/{id}/dispose")
    public ResponseEntity<String> disposeAsset(
            @PathVariable Long id,
            @RequestParam BigDecimal proceeds) {
        log.info("Disposing asset: {} with proceeds: {}", id, proceeds);
        fixedAssetService.disposeAsset(id, proceeds, "system");
        return ResponseEntity.ok("Asset disposed successfully");
    }
}
