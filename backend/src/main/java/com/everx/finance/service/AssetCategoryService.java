package com.everx.finance.service;

import com.everx.finance.entity.AssetCategory;
import com.everx.finance.repository.AssetCategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AssetCategoryService {
    private final AssetCategoryRepository categoryRepository;

    /**
     * Create asset category
     */
    public AssetCategory createCategory(AssetCategory category, String createdBy) {
        log.info("Creating asset category: {}", category.getCategoryCode());
        
        if (categoryRepository.findByCategoryCode(category.getCategoryCode()).isPresent()) {
            throw new RuntimeException("Category code already exists");
        }
        
        category.setCreatedDate(LocalDate.now());
        category.setCreatedBy(createdBy);
        
        return categoryRepository.save(category);
    }

    /**
     * Get all categories
     */
    public List<AssetCategory> getAllCategories() {
        return categoryRepository.findAll();
    }

    /**
     * Get category by code
     */
    public AssetCategory getCategoryByCode(String code) {
        return categoryRepository.findByCategoryCode(code)
                .orElseThrow(() -> new RuntimeException("Category not found: " + code));
    }
}
