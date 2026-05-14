package com.everx.erp.purchaseorder;

import com.everx.erp.equipment.Equipment;
import com.everx.erp.equipment.EquipmentRepository;
import com.everx.erp.equipment.EquipmentStatus;
import com.everx.erp.numbering.DocumentNumberGenerator;
import com.everx.erp.suppliers.SupplierRepository;
import com.everx.erp.purchaseorder.dto.*;
import com.everx.finance.posting.GlPostingService;
import com.everx.shared.exception.EntityNotFoundException;
import com.everx.shared.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final EquipmentRepository equipmentRepository;
    private final SupplierRepository supplierRepository;
    private final PurchaseReceiptRepository purchaseReceiptRepository;
    private final DocumentNumberGenerator documentNumberGenerator;
    private final GlPostingService glPostingService;

    @Transactional
    public PurchaseOrderDto createPurchaseOrder(CreatePurchaseOrderRequest request) {
        // WORKFLOW RULE: Purchase orders must be linked to an existing supplier
        if (request.getSupplierId() == null) {
            throw new ValidationException("Purchase order must be linked to a Supplier.");
        }
        supplierRepository.findByIdAndNotDeleted(request.getSupplierId())
                .orElseThrow(() -> new EntityNotFoundException("Supplier not found with id: " + request.getSupplierId()));

        PurchaseOrder po = new PurchaseOrder();
        po.setPoNumber(generatePurchaseOrderNumber());
        po.setSupplierId(request.getSupplierId());
        po.setStatus(request.getStatus());
        po.setOrderDate(request.getOrderDate());
        po.setExpectedDelivery(request.getExpectedDelivery());
        po.setActualDelivery(request.getActualDelivery());
        po.setCurrency(request.getCurrency());
        po.setTotalAmount(request.getTotalAmount());
        po.setPaymentMethod(request.getPaymentMethod());
        po.setShippingDocs(request.getShippingDocs());
        po.setNotes(request.getNotes());

        if (request.getItems() != null) {
            List<PurchaseOrderItem> items = request.getItems().stream()
                    .map(itemReq -> {
                        PurchaseOrderItem item = new PurchaseOrderItem();
                        item.setPurchaseOrder(po);
                        item.setEquipmentId(itemReq.getEquipmentId());
                        item.setSparePartId(itemReq.getSparePartId());
                        item.setDescription(itemReq.getDescription());
                        item.setQuantity(itemReq.getQuantity());
                        item.setUnitPrice(itemReq.getUnitPrice());
                        item.setLineTotal(itemReq.getLineTotal());
                        return item;
                    })
                    .collect(Collectors.toList());
            po.setItems(items);
        }

        PurchaseOrder saved = purchaseOrderRepository.save(po);
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public PurchaseOrderDto getPurchaseOrderById(UUID id) {
        PurchaseOrder po = purchaseOrderRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Purchase order not found with id: " + id));
        return toDto(po);
    }

    @Transactional(readOnly = true)
    public Page<PurchaseOrderDto> getAllPurchaseOrders(Pageable pageable) {
        return purchaseOrderRepository.findAllNotDeleted(pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Page<PurchaseOrderDto> getPurchaseOrdersByStatus(String status, Pageable pageable) {
        return purchaseOrderRepository.findByStatus(status, pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Page<PurchaseOrderDto> getPurchaseOrdersBySupplierId(UUID supplierId, Pageable pageable) {
        return purchaseOrderRepository.findBySupplierId(supplierId, pageable).map(this::toDto);
    }

    @Transactional
    public PurchaseOrderDto updatePurchaseOrder(UUID id, CreatePurchaseOrderRequest request) {
        PurchaseOrder po = purchaseOrderRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Purchase order not found with id: " + id));

        if (request.getSupplierId() != null) po.setSupplierId(request.getSupplierId());
        if (request.getStatus() != null) po.setStatus(request.getStatus());
        if (request.getOrderDate() != null) po.setOrderDate(request.getOrderDate());
        if (request.getExpectedDelivery() != null) po.setExpectedDelivery(request.getExpectedDelivery());
        if (request.getActualDelivery() != null) po.setActualDelivery(request.getActualDelivery());
        if (request.getCurrency() != null) po.setCurrency(request.getCurrency());
        if (request.getTotalAmount() != null) po.setTotalAmount(request.getTotalAmount());
        if (request.getPaymentMethod() != null) po.setPaymentMethod(request.getPaymentMethod());
        if (request.getShippingDocs() != null) po.setShippingDocs(request.getShippingDocs());
        if (request.getNotes() != null) po.setNotes(request.getNotes());

        if (request.getItems() != null) {
            po.getItems().clear();
            List<PurchaseOrderItem> items = request.getItems().stream()
                    .map(itemReq -> {
                        PurchaseOrderItem item = new PurchaseOrderItem();
                        item.setPurchaseOrder(po);
                        item.setEquipmentId(itemReq.getEquipmentId());
                        item.setSparePartId(itemReq.getSparePartId());
                        item.setDescription(itemReq.getDescription());
                        item.setQuantity(itemReq.getQuantity());
                        item.setUnitPrice(itemReq.getUnitPrice());
                        item.setLineTotal(itemReq.getLineTotal());
                        return item;
                    })
                    .collect(Collectors.toList());
            po.getItems().addAll(items);
        }

        PurchaseOrder updated = purchaseOrderRepository.save(po);
        return toDto(updated);
    }

    @Transactional
    public void deletePurchaseOrder(UUID id) {
        PurchaseOrder po = purchaseOrderRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Purchase order not found with id: " + id));
        po.softDelete();
        purchaseOrderRepository.save(po);
    }

    @Transactional
    public PurchaseOrderDto updateStatus(UUID id, String status) {
        PurchaseOrder po = purchaseOrderRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Purchase order not found with id: " + id));
        po.setStatus(status);
        return toDto(purchaseOrderRepository.save(po));
    }

    @Transactional
    public PurchaseOrderDto receivePurchaseOrder(UUID id) {
        PurchaseOrder po = purchaseOrderRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Purchase order not found with id: " + id));

        po.setStatus("RECEIVED");
        if (po.getActualDelivery() == null) {
            po.setActualDelivery(LocalDate.now());
        }

        int totalQuantity = 0;
        BigDecimal totalAmount = BigDecimal.ZERO;
        if (po.getItems() != null) {
            int autoSequence = 1;
            for (PurchaseOrderItem item : po.getItems()) {
                if (item.getQuantity() != null) {
                    totalQuantity += item.getQuantity();
                }
                if (item.getLineTotal() != null) {
                    totalAmount = totalAmount.add(item.getLineTotal());
                } else if (item.getUnitPrice() != null && item.getQuantity() != null) {
                    totalAmount = totalAmount.add(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
                }

                if (item.getEquipmentId() != null) {
                    Equipment existing = equipmentRepository.findByIdAndNotDeleted(item.getEquipmentId())
                            .orElseThrow(() -> new ValidationException("Equipment not found for PO item: " + item.getEquipmentId()));
                    existing.setStatus(EquipmentStatus.IN_REFURBISHMENT);
                    equipmentRepository.save(existing);
                    continue;
                }

                Equipment equipment = new Equipment();
                equipment.setInternalCode(generateAutoEquipmentCode(po, autoSequence++));
                equipment.setMake("TBD");
                equipment.setModel(item.getDescription() != null ? item.getDescription() : "AUTO-CREATED");
                equipment.setCategory("UNSPECIFIED");
                equipment.setStatus(EquipmentStatus.IN_REFURBISHMENT);
                equipment.setAcquisitionCost(item.getLineTotal());
                equipment.setAcquisitionCurrency(po.getCurrency());
                equipment.setNotes("Auto-created from PO " + po.getPoNumber() + " on receive");

                Equipment savedEquipment = equipmentRepository.save(equipment);
                item.setEquipmentId(savedEquipment.getId());
            }
        }

            PurchaseReceipt receipt = PurchaseReceipt.builder()
                .poId(po.getId())
                .receivedDate(po.getActualDelivery() != null ? po.getActualDelivery() : LocalDate.now())
                .totalQuantity(totalQuantity)
                .totalAmount(totalAmount)
                .currency(po.getCurrency())
                .build();
            PurchaseReceipt savedReceipt = purchaseReceiptRepository.save(receipt);

            // AP accrual: DR Expense (5000) / CR Accounts Payable (2100)
            if (totalAmount.compareTo(BigDecimal.ZERO) > 0) {
                glPostingService.postApAccrual(
                    po.getPoNumber(),
                    totalAmount,
                    po.getCurrency() != null ? po.getCurrency() : "AUD",
                    savedReceipt.getReceivedDate(),
                    "DEFAULT"   // PO entity resolved at supplier level; DEFAULT maps to consolidated ledger
                );
            }

        return toDto(purchaseOrderRepository.save(po));
    }

    private String generateAutoEquipmentCode(PurchaseOrder po, int sequence) {
        int year = LocalDate.now().getYear();
        String poSeed = po.getPoNumber() == null ? "PO" : po.getPoNumber().replaceAll("[^A-Za-z0-9]", "");
        String suffix = poSeed.length() > 6 ? poSeed.substring(poSeed.length() - 6) : poSeed;
        return String.format("EVX-AUTO-%d-%s-%03d", year, suffix, sequence);
    }

    private String generatePurchaseOrderNumber() {
        return documentNumberGenerator.generate("PO", candidate -> purchaseOrderRepository.findByPoNumber(candidate).isPresent());
    }

    private PurchaseOrderDto toDto(PurchaseOrder po) {
        PurchaseOrderDto dto = new PurchaseOrderDto();
        dto.setId(po.getId());
        dto.setPoNumber(po.getPoNumber());
        dto.setSupplierId(po.getSupplierId());
        dto.setStatus(po.getStatus());
        dto.setOrderDate(po.getOrderDate());
        dto.setExpectedDelivery(po.getExpectedDelivery());
        dto.setActualDelivery(po.getActualDelivery());
        dto.setCurrency(po.getCurrency());
        dto.setTotalAmount(po.getTotalAmount());
        dto.setPaymentMethod(po.getPaymentMethod());
        dto.setShippingDocs(po.getShippingDocs());
        dto.setNotes(po.getNotes());
        dto.setCreatedAt(po.getCreatedAt().toInstant());
        dto.setUpdatedAt(po.getUpdatedAt().toInstant());

        if (po.getItems() != null) {
            List<PurchaseOrderItemDto> itemDtos = po.getItems().stream()
                    .map(item -> {
                        PurchaseOrderItemDto itemDto = new PurchaseOrderItemDto();
                        itemDto.setId(item.getId());
                        itemDto.setEquipmentId(item.getEquipmentId());
                        itemDto.setSparePartId(item.getSparePartId());
                        itemDto.setDescription(item.getDescription());
                        itemDto.setQuantity(item.getQuantity());
                        itemDto.setUnitPrice(item.getUnitPrice());
                        itemDto.setLineTotal(item.getLineTotal());
                        itemDto.setCreatedAt(item.getCreatedAt().toInstant());
                        itemDto.setUpdatedAt(item.getUpdatedAt().toInstant());
                        return itemDto;
                    })
                    .collect(Collectors.toList());
            dto.setItems(itemDtos);
        }

        return dto;
    }
}
