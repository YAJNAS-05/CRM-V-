package com.everx.erp.suppliers;

import com.everx.erp.suppliers.dto.CreateSupplierRequest;
import com.everx.erp.suppliers.dto.SupplierDto;
import com.everx.shared.exception.EntityNotFoundException;
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

    @Transactional
    public SupplierDto createSupplier(CreateSupplierRequest request) {
        Supplier supplier = new Supplier();
        supplier.setCompanyName(request.getCompanyName());
        supplier.setCountry(request.getCountry());
        supplier.setContactName(request.getContactName());
        supplier.setEmail(request.getEmail());
        supplier.setPhone(request.getPhone());
        supplier.setSupplierType(request.getSupplierType());
        supplier.setPaymentTerms(request.getPaymentTerms());
        supplier.setNotes(request.getNotes());
        return toDto(supplierRepository.save(supplier));
    }

    @Transactional(readOnly = true)
    public SupplierDto getSupplierById(UUID id) {
        return toDto(supplierRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Supplier not found with id: " + id)));
    }

    @Transactional(readOnly = true)
    public Page<SupplierDto> getAllSuppliers(Pageable pageable) {
        return supplierRepository.findAllNotDeleted(pageable).map(this::toDto);
    }

    @Transactional
    public SupplierDto updateSupplier(UUID id, CreateSupplierRequest request) {
        Supplier supplier = supplierRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Supplier not found with id: " + id));
        if (request.getCompanyName() != null) supplier.setCompanyName(request.getCompanyName());
        if (request.getCountry() != null) supplier.setCountry(request.getCountry());
        if (request.getContactName() != null) supplier.setContactName(request.getContactName());
        if (request.getEmail() != null) supplier.setEmail(request.getEmail());
        if (request.getPhone() != null) supplier.setPhone(request.getPhone());
        if (request.getSupplierType() != null) supplier.setSupplierType(request.getSupplierType());
        if (request.getPaymentTerms() != null) supplier.setPaymentTerms(request.getPaymentTerms());
        if (request.getNotes() != null) supplier.setNotes(request.getNotes());
        return toDto(supplierRepository.save(supplier));
    }

    @Transactional
    public void deleteSupplier(UUID id) {
        Supplier supplier = supplierRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Supplier not found with id: " + id));
        supplier.softDelete();
        supplierRepository.save(supplier);
    }

    private SupplierDto toDto(Supplier supplier) {
        SupplierDto dto = new SupplierDto();
        dto.setId(supplier.getId());
        dto.setCompanyName(supplier.getCompanyName());
        dto.setCountry(supplier.getCountry());
        dto.setContactName(supplier.getContactName());
        dto.setEmail(supplier.getEmail());
        dto.setPhone(supplier.getPhone());
        dto.setSupplierType(supplier.getSupplierType());
        dto.setPaymentTerms(supplier.getPaymentTerms());
        dto.setNotes(supplier.getNotes());
        dto.setCreatedAt(supplier.getCreatedAt().toInstant());
        dto.setUpdatedAt(supplier.getUpdatedAt().toInstant());
        return dto;
    }
}
