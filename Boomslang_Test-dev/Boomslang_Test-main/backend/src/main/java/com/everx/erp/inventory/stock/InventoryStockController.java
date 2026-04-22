package com.everx.erp.inventory.stock;

import com.everx.erp.inventory.bin.InventoryBinRepository;
import com.everx.erp.inventory.bin.dto.InventoryBinDto;
import com.everx.erp.inventory.ledger.InventoryLedgerRepository;
import com.everx.erp.inventory.ledger.dto.InventoryLedgerEntryDto;
import com.everx.erp.inventory.stock.dto.CreateStockAdjustmentRequest;
import com.everx.erp.inventory.transfer.InventoryTransferRepository;
import com.everx.erp.inventory.transfer.dto.CreateInventoryTransferRequest;
import com.everx.erp.inventory.transfer.dto.InventoryTransferDto;
import com.everx.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/erp/inventory")
@RequiredArgsConstructor
@Slf4j
public class InventoryStockController {

    private final InventoryStockService inventoryStockService;
    private final InventoryLedgerRepository inventoryLedgerRepository;
    private final InventoryBinRepository inventoryBinRepository;
    private final InventoryTransferRepository inventoryTransferRepository;

    @GetMapping("/ledger")
    @PreAuthorize("hasAuthority('ERP_VIEW')")
    public ResponseEntity<ApiResponse<Page<InventoryLedgerEntryDto>>> getLedger(
            @RequestParam(required = false) UUID itemId,
            @RequestParam(required = false) String location,
            @PageableDefault(size = 50, page = 0, sort = "transactionAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/v1/erp/inventory/ledger");
        Page<InventoryLedgerEntryDto> entries;
        if (itemId != null) {
            entries = inventoryLedgerRepository.findByItemId(itemId, pageable)
                    .map(InventoryLedgerEntryDto::fromEntity);
        } else {
            entries = inventoryLedgerRepository.findByLocation(location, pageable)
                    .map(InventoryLedgerEntryDto::fromEntity);
        }
        return ResponseEntity.ok(ApiResponse.ok(entries, "Inventory ledger retrieved"));
    }

    @GetMapping("/bins")
    @PreAuthorize("hasAuthority('ERP_VIEW')")
    public ResponseEntity<ApiResponse<List<InventoryBinDto>>> getBins(@RequestParam UUID itemId) {
        log.info("GET /api/v1/erp/inventory/bins");
        List<InventoryBinDto> bins = inventoryBinRepository.findByItemId(itemId).stream()
                .map(InventoryBinDto::fromEntity)
                .toList();
        return ResponseEntity.ok(ApiResponse.ok(bins, "Inventory bins retrieved"));
    }

    @GetMapping("/transfers")
    @PreAuthorize("hasAuthority('ERP_VIEW')")
    public ResponseEntity<ApiResponse<Page<InventoryTransferDto>>> getTransfers(
            @PageableDefault(size = 20, page = 0, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/v1/erp/inventory/transfers");
        Page<InventoryTransferDto> transfers = inventoryTransferRepository.findAllTransfers(pageable)
                .map(InventoryTransferDto::fromEntity);
        return ResponseEntity.ok(ApiResponse.ok(transfers, "Inventory transfers retrieved"));
    }

    @PostMapping("/adjustments")
    @PreAuthorize("hasAuthority('ERP_EDIT')")
    public ResponseEntity<ApiResponse<InventoryLedgerEntryDto>> createAdjustment(
            @Valid @RequestBody CreateStockAdjustmentRequest request) {
        log.info("POST /api/v1/erp/inventory/adjustments");
        InventoryLedgerEntryDto entry = inventoryStockService.adjustStock(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(entry, "Stock adjustment posted"));
    }

    @PostMapping("/transfers")
    @PreAuthorize("hasAuthority('ERP_EDIT')")
    public ResponseEntity<ApiResponse<InventoryTransferDto>> createTransfer(
            @Valid @RequestBody CreateInventoryTransferRequest request) {
        log.info("POST /api/v1/erp/inventory/transfers");
        InventoryTransferDto transfer = inventoryStockService.transferStock(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(transfer, "Inventory transfer posted"));
    }
}
