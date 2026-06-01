package com.everx.finance.controller;

import com.everx.finance.account.dto.CreateGlAccountRequest;
import com.everx.finance.account.dto.GlAccountResponse;
import com.everx.finance.account.dto.UpdateGlAccountRequest;
import com.everx.finance.account.service.GlAccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/finance/coa")
@RequiredArgsConstructor
public class GlAccountController {
    private final GlAccountService glAccountService;

    @PostMapping
    public ResponseEntity<GlAccountResponse> createAccount(@Valid @RequestBody CreateGlAccountRequest request) {
        return ResponseEntity.ok(glAccountService.createGlAccount(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GlAccountResponse> updateAccount(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateGlAccountRequest request) {
        return ResponseEntity.ok(glAccountService.updateGlAccount(id, request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GlAccountResponse> getAccount(@PathVariable UUID id) {
        return ResponseEntity.ok(glAccountService.getGlAccountById(id));
    }

    @GetMapping
    public ResponseEntity<List<GlAccountResponse>> listAccounts(@RequestParam UUID companyId) {
        return ResponseEntity.ok(glAccountService.getAccountHierarchy(companyId));
    }

    @GetMapping("/tree")
    public ResponseEntity<List<GlAccountResponse>> getAccountTree(@RequestParam UUID companyId) {
        return ResponseEntity.ok(glAccountService.getAccountHierarchy(companyId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAccount(@PathVariable UUID id) {
        glAccountService.archiveGlAccount(id);
        return ResponseEntity.noContent().build();
    }
}
