package com.everx.erp.purchaseorder;

import com.everx.erp.purchaseorder.dto.PurchaseOrderResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;

    public Page<PurchaseOrderResponse> findAll(Pageable pageable) {
        return purchaseOrderRepository.findAll(pageable).map(this::toResponse);
    }

    public PurchaseOrderResponse findById(UUID id) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Purchase Order not found"));
        return toResponse(po);
    }

    @Transactional
    public PurchaseOrderResponse create(PurchaseOrder request) {
        request.setPoNumber(generatePONumber());
        request.setStatus("DRAFT");
        return toResponse(purchaseOrderRepository.save(request));
    }

    @Transactional
    public PurchaseOrderResponse update(UUID id, PurchaseOrder request) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Purchase Order not found"));
        po.setOrderDate(request.getOrderDate());
        po.setDeliveryDate(request.getDeliveryDate());
        po.setTotalAmount(request.getTotalAmount());
        po.setCurrency(request.getCurrency());
        return toResponse(purchaseOrderRepository.save(po));
    }

    private String generatePONumber() {
        return "PO-" + System.currentTimeMillis();
    }

    private PurchaseOrderResponse toResponse(PurchaseOrder po) {
        return PurchaseOrderResponse.builder()
            .id(po.getId())
            .poNumber(po.getPoNumber())
            .vendorId(po.getVendorId())
            .companyCode(po.getCompanyCode())
            .orderDate(po.getOrderDate())
            .deliveryDate(po.getDeliveryDate())
            .totalAmount(po.getTotalAmount())
            .currency(po.getCurrency())
            .status(po.getStatus())
            .build();
    }
}
