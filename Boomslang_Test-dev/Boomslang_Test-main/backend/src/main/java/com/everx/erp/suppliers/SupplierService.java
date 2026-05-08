package com.everx.erp.suppliers;

import com.everx.erp.suppliers.dto.SupplierResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;

    public Page<SupplierResponse> findAll(Pageable pageable) {
        return supplierRepository.findAll(pageable).map(this::toResponse);
    }

    public SupplierResponse findById(UUID id) {
        Supplier supplier = supplierRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Supplier not found"));
        return toResponse(supplier);
    }

    @Transactional
    public SupplierResponse create(Supplier supplier) {
        supplier.setSupplierNumber(generateSupplierNumber());
        supplier.setIsActive(true);
        return toResponse(supplierRepository.save(supplier));
    }

    @Transactional
    public SupplierResponse update(UUID id, Supplier request) {
        Supplier supplier = supplierRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Supplier not found"));
        supplier.setName(request.getName());
        supplier.setContactPerson(request.getContactPerson());
        supplier.setEmail(request.getEmail());
        supplier.setPhone(request.getPhone());
        supplier.setAddress(request.getAddress());
        return toResponse(supplierRepository.save(supplier));
    }

    @Transactional
    public void delete(UUID id) {
        supplierRepository.deleteById(id);
    }

    private String generateSupplierNumber() {
        return "SUP-" + System.currentTimeMillis();
    }

    private SupplierResponse toResponse(Supplier supplier) {
        return SupplierResponse.builder()
            .id(supplier.getId())
            .supplierNumber(supplier.getSupplierNumber())
            .name(supplier.getName())
            .contactPerson(supplier.getContactPerson())
            .email(supplier.getEmail())
            .phone(supplier.getPhone())
            .address(supplier.getAddress())
            .isActive(supplier.getIsActive())
            .build();
    }
}
