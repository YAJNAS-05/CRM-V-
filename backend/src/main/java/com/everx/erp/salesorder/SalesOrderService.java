package com.everx.erp.salesorder;

import com.everx.erp.equipment.Equipment;
import com.everx.erp.equipment.EquipmentRepository;
import com.everx.erp.equipment.EquipmentStatus;
import com.everx.erp.logistics.Shipment;
import com.everx.erp.logistics.ShipmentRepository;
import com.everx.erp.numbering.DocumentNumberGenerator;
import com.everx.finance.invoice.Invoice;
import com.everx.finance.invoice.InvoiceRepository;
import com.everx.erp.salesorder.dto.*;
import com.everx.shared.saga.SagaOrchestrator;
import com.everx.shared.exception.EntityNotFoundException;
import com.everx.shared.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SalesOrderService {

    private final SalesOrderRepository salesOrderRepository;
    private final EquipmentRepository equipmentRepository;
    private final ShipmentRepository shipmentRepository;
    private final InvoiceRepository invoiceRepository;
    private final SagaOrchestrator sagaOrchestrator;
    private final DocumentNumberGenerator documentNumberGenerator;

    @Transactional
    public SalesOrderDto createSalesOrder(CreateSalesOrderRequest request) {
        SalesOrder so = new SalesOrder();
        so.setSoNumber(generateSalesOrderNumber());
        so.setDealId(request.getDealId());
        so.setAccountId(request.getAccountId());
        so.setStatus(request.getStatus());
        so.setOrderDate(request.getOrderDate());
        so.setExpectedDelivery(request.getExpectedDelivery());
        so.setActualDelivery(request.getActualDelivery());
        so.setCurrency(request.getCurrency());
        so.setTotalAmount(request.getTotalAmount());
        so.setIncoterms(request.getIncoterms());
        so.setDestinationCountry(request.getDestinationCountry());
        so.setNotes(request.getNotes());

        if (request.getItems() != null) {
            List<SalesOrderItem> items = request.getItems().stream()
                    .map(itemReq -> {
                        SalesOrderItem item = new SalesOrderItem();
                        item.setSalesOrder(so);
                        item.setEquipmentId(itemReq.getEquipmentId());
                        item.setQuantity(itemReq.getQuantity());
                        item.setUnitPrice(itemReq.getUnitPrice());
                        item.setLineTotal(itemReq.getLineTotal());
                        return item;
                    })
                    .collect(Collectors.toList());
            so.setItems(items);
        }

        return toDto(salesOrderRepository.save(so));
    }

    @Transactional(readOnly = true)
    public SalesOrderDto getSalesOrderById(UUID id) {
        return toDto(salesOrderRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Sales order not found with id: " + id)));
    }

    @Transactional(readOnly = true)
    public Page<SalesOrderDto> getAllSalesOrders(Pageable pageable) {
        return salesOrderRepository.findAllNotDeleted(pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Page<SalesOrderDto> getSalesOrdersByStatus(String status, Pageable pageable) {
        return salesOrderRepository.findByStatus(status, pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Page<SalesOrderDto> getSalesOrdersByAccountId(UUID accountId, Pageable pageable) {
        return salesOrderRepository.findByAccountId(accountId, pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Page<SalesOrderDto> getSalesOrdersByDealId(UUID dealId, Pageable pageable) {
        return salesOrderRepository.findByDealId(dealId, pageable).map(this::toDto);
    }

    @Transactional
    public SalesOrderDto updateSalesOrder(UUID id, CreateSalesOrderRequest request) {
        SalesOrder so = salesOrderRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Sales order not found with id: " + id));

        if (request.getDealId() != null) so.setDealId(request.getDealId());
        if (request.getAccountId() != null) so.setAccountId(request.getAccountId());
        if (request.getStatus() != null) so.setStatus(request.getStatus());
        if (request.getOrderDate() != null) so.setOrderDate(request.getOrderDate());
        if (request.getExpectedDelivery() != null) so.setExpectedDelivery(request.getExpectedDelivery());
        if (request.getActualDelivery() != null) so.setActualDelivery(request.getActualDelivery());
        if (request.getCurrency() != null) so.setCurrency(request.getCurrency());
        if (request.getTotalAmount() != null) so.setTotalAmount(request.getTotalAmount());
        if (request.getIncoterms() != null) so.setIncoterms(request.getIncoterms());
        if (request.getDestinationCountry() != null) so.setDestinationCountry(request.getDestinationCountry());
        if (request.getNotes() != null) so.setNotes(request.getNotes());

        if (request.getItems() != null) {
            so.getItems().clear();
            List<SalesOrderItem> items = request.getItems().stream()
                    .map(itemReq -> {
                        SalesOrderItem item = new SalesOrderItem();
                        item.setSalesOrder(so);
                        item.setEquipmentId(itemReq.getEquipmentId());
                        item.setQuantity(itemReq.getQuantity());
                        item.setUnitPrice(itemReq.getUnitPrice());
                        item.setLineTotal(itemReq.getLineTotal());
                        return item;
                    })
                    .collect(Collectors.toList());
            so.getItems().addAll(items);
        }

        return toDto(salesOrderRepository.save(so));
    }

    @Transactional
    public void deleteSalesOrder(UUID id) {
        SalesOrder so = salesOrderRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Sales order not found with id: " + id));
        so.softDelete();
        salesOrderRepository.save(so);
    }

    @Transactional
    public SalesOrderDto confirmSalesOrder(UUID id) {
        SalesOrder so = salesOrderRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Sales order not found with id: " + id));

        if (so.getItems() == null || so.getItems().isEmpty()) {
            throw new ValidationException("Cannot confirm a sales order without at least one item");
        }

        String sagaId = sagaOrchestrator.initiateSalesOrderSaga(
            so.getId(),
            "SALES_ORDER_CONFIRM",
            java.util.Map.of("soId", so.getId().toString())
        );

        try {
            for (SalesOrderItem item : so.getItems()) {
                if (item.getEquipmentId() == null) {
                    throw new ValidationException("Sales order item missing equipment reference");
                }

                Equipment equipment = equipmentRepository.findByIdAndNotDeleted(item.getEquipmentId())
                        .orElseThrow(() -> new ValidationException("Equipment not found: " + item.getEquipmentId()));

                if (equipment.getStatus() == EquipmentStatus.SOLD) {
                    throw new ValidationException("Equipment already sold: " + equipment.getInternalCode());
                }

                equipment.setStatus(EquipmentStatus.RESERVED);
                equipmentRepository.save(equipment);
            }

            sagaOrchestrator.transitionStep(sagaId, "RESERVE_INVENTORY", java.util.Map.of("soId", so.getId().toString()));

            so.setStatus("CONFIRMED");
            SalesOrder savedSo = salesOrderRepository.save(so);

            if (!shipmentRepository.findBySoId(savedSo.getId(), PageRequest.of(0, 1)).hasContent()) {
                Shipment shipment = new Shipment();
                shipment.setSoId(savedSo.getId());
                shipment.setStatus("PREPARING");
                shipment.setDestinationCountry(savedSo.getDestinationCountry());
                shipmentRepository.save(shipment);
            }

            sagaOrchestrator.transitionStep(sagaId, "CREATE_SALES_ORDER", java.util.Map.of("soId", so.getId().toString()));

            createDepositInvoice(savedSo);

            sagaOrchestrator.transitionStep(sagaId, "CREATE_INVOICE", java.util.Map.of("soId", so.getId().toString()));
            sagaOrchestrator.markComplete(sagaId);

            return toDto(savedSo);
        } catch (RuntimeException ex) {
            sagaOrchestrator.handleFailure(sagaId, "CONFIRM_SALES_ORDER", ex.getMessage());
            rollbackSalesOrderConfirmation(so);
            throw ex;
        }
    }

    private void rollbackSalesOrderConfirmation(SalesOrder so) {
        if (so.getItems() != null) {
            for (SalesOrderItem item : so.getItems()) {
                if (item.getEquipmentId() == null) continue;
                Equipment equipment = equipmentRepository.findByIdAndNotDeleted(item.getEquipmentId()).orElse(null);
                if (equipment == null) continue;
                if (equipment.getStatus() == EquipmentStatus.RESERVED || equipment.getStatus() == EquipmentStatus.IN_TRANSIT) {
                    equipment.setStatus(EquipmentStatus.IN_WAREHOUSE);
                    equipmentRepository.save(equipment);
                }
            }
        }

        shipmentRepository.findBySoId(so.getId(), PageRequest.of(0, 100)).getContent().forEach(shipment -> {
            if (!"DELIVERED".equalsIgnoreCase(shipment.getStatus())
                    && !"CANCELLED".equalsIgnoreCase(shipment.getStatus())) {
                shipment.setStatus("CANCELLED");
                shipmentRepository.save(shipment);
            }
        });

        invoiceRepository.findBySoIdAndIsDeletedFalse(so.getId()).forEach(invoice -> {
            if (invoice.getStatus() == Invoice.InvoiceStatus.DRAFT || invoice.getStatus() == Invoice.InvoiceStatus.SENT) {
                invoice.setStatus(Invoice.InvoiceStatus.CANCELLED);
                invoice.setIsDeleted(true);
                invoice.setUpdatedAt(OffsetDateTime.now());
                invoiceRepository.save(invoice);
            }
        });

        so.setStatus("DRAFT");
        salesOrderRepository.save(so);
    }

    @Transactional
    public SalesOrderDto cancelSalesOrder(UUID id) {
        SalesOrder so = salesOrderRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Sales order not found with id: " + id));

        if ("INSTALLED".equals(so.getStatus()) || "DELIVERED".equals(so.getStatus())) {
            throw new ValidationException("Cannot cancel a sales order that has already been delivered or installed");
        }
        if ("CANCELLED".equals(so.getStatus())) {
            throw new ValidationException("Sales order is already cancelled");
        }

        // Release reserved/in-transit equipment back to warehouse
        if (so.getItems() != null) {
            for (SalesOrderItem item : so.getItems()) {
                if (item.getEquipmentId() == null) continue;
                Equipment equipment = equipmentRepository.findByIdAndNotDeleted(item.getEquipmentId()).orElse(null);
                if (equipment == null) continue;
                if (equipment.getStatus() == EquipmentStatus.RESERVED
                        || equipment.getStatus() == EquipmentStatus.IN_TRANSIT) {
                    equipment.setStatus(EquipmentStatus.IN_WAREHOUSE);
                    equipmentRepository.save(equipment);
                }
            }
        }

        // Cancel any active shipments linked to this SO
        shipmentRepository.findBySoId(so.getId(), PageRequest.of(0, 100)).getContent().forEach(shipment -> {
            if (!"DELIVERED".equalsIgnoreCase(shipment.getStatus())
                    && !"CANCELLED".equalsIgnoreCase(shipment.getStatus())) {
                shipment.setStatus("CANCELLED");
                shipmentRepository.save(shipment);
            }
        });

        so.setStatus("CANCELLED");
        return toDto(salesOrderRepository.save(so));
    }

    private void createDepositInvoice(SalesOrder so) {
        BigDecimal total = so.getTotalAmount() == null ? BigDecimal.ZERO : so.getTotalAmount();
        BigDecimal deposit = total.multiply(new BigDecimal("0.30"));

        Invoice invoice = Invoice.builder()
                .invoiceNumber(generateWorkflowInvoiceNumber(so.getSoNumber()))
                .soId(so.getId())
                .accountId(so.getAccountId())
                .entity(Invoice.InvoiceEntity.AUSTRALIA)
                .type(Invoice.InvoiceType.PROFORMA)
                .status(Invoice.InvoiceStatus.DRAFT)
                .issueDate(LocalDate.now())
                .dueDate(LocalDate.now().plusDays(14))
                .currency(so.getCurrency())
                .subtotal(deposit)
                .taxAmount(BigDecimal.ZERO)
                .totalAmount(deposit)
                .paidAmount(BigDecimal.ZERO)
                .notes("Auto-generated deposit invoice from confirmed SO " + so.getSoNumber())
                .build();

        invoice.setCreatedAt(OffsetDateTime.now());
        invoice.setUpdatedAt(OffsetDateTime.now());
        invoiceRepository.save(invoice);
    }

    private String generateWorkflowInvoiceNumber(String soNumber) {
        String seed = soNumber == null ? "SO" : soNumber.replaceAll("[^A-Za-z0-9]", "");
        if (seed.length() > 8) {
            seed = seed.substring(seed.length() - 8);
        }
        return "INV-WF-" + LocalDate.now().getYear() + "-" + seed + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    }

    private String generateSalesOrderNumber() {
        return documentNumberGenerator.generate("SO", candidate -> salesOrderRepository.findBySoNumber(candidate).isPresent());
    }

    private SalesOrderDto toDto(SalesOrder so) {
        SalesOrderDto dto = new SalesOrderDto();
        dto.setId(so.getId());
        dto.setSoNumber(so.getSoNumber());
        dto.setDealId(so.getDealId());
        dto.setAccountId(so.getAccountId());
        dto.setStatus(so.getStatus());
        dto.setOrderDate(so.getOrderDate());
        dto.setExpectedDelivery(so.getExpectedDelivery());
        dto.setActualDelivery(so.getActualDelivery());
        dto.setCurrency(so.getCurrency());
        dto.setTotalAmount(so.getTotalAmount());
        dto.setIncoterms(so.getIncoterms());
        dto.setDestinationCountry(so.getDestinationCountry());
        dto.setNotes(so.getNotes());
        dto.setCreatedAt(so.getCreatedAt().toInstant());
        dto.setUpdatedAt(so.getUpdatedAt().toInstant());

        if (so.getItems() != null) {
            List<SalesOrderItemDto> itemDtos = so.getItems().stream()
                    .map(item -> {
                        SalesOrderItemDto itemDto = new SalesOrderItemDto();
                        itemDto.setId(item.getId());
                        itemDto.setEquipmentId(item.getEquipmentId());
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
