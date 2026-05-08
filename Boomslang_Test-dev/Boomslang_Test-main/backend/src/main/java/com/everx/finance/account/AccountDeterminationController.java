package com.everx.finance.account;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/account-determination")
@RequiredArgsConstructor
public class AccountDeterminationController {

    private final AccountDeterminationService service;

    @GetMapping
    public ResponseEntity<List<AccountDetermination>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AccountDetermination> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<AccountDetermination> create(@RequestBody CreateAccountDeterminationRequest request) {
        return ResponseEntity.ok(service.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AccountDetermination> update(@PathVariable UUID id, @RequestBody AccountDetermination request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/determine")
    public ResponseEntity<AccountDeterminationResponse> determine(
            @RequestParam String companyCode,
            @RequestParam String transactionKey,
            @RequestParam String valuationClass) {
        return ResponseEntity.ok(service.determineAccount(companyCode, transactionKey, valuationClass));
    }
}
