package com.example.mobistock.service.impl;

import com.example.mobistock.domain.entity.Category;
import com.example.mobistock.dto.request.CreateCategoryRequest;
import com.example.mobistock.dto.request.UpdateCategoryRequest;
import com.example.mobistock.dto.response.CategoryResponse;
import com.example.mobistock.exception.BadRequestException;
import com.example.mobistock.exception.ResourceNotFoundException;
import com.example.mobistock.mapper.StockMapper;
import com.example.mobistock.repository.CategoryRepository;
import com.example.mobistock.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final StockMapper stockMapper;

    @Override
    @Transactional
    public CategoryResponse createCategory(CreateCategoryRequest request) {
        if (categoryRepository.findByCategoryNameThIgnoreCase(request.getCategoryNameTh()).isPresent()) {
            throw new BadRequestException("Category with name '" + request.getCategoryNameTh() + "' already exists");
        }
        Category category = stockMapper.toCategoryEntity(request);
        Category savedCategory = categoryRepository.save(category);
        return stockMapper.toCategoryResponse(savedCategory);
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(Long categoryId, UpdateCategoryRequest request) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));

        category.setCategoryNameTh(request.getCategoryNameTh());
        category.setCategoryNameEn(request.getCategoryNameEn());
        if (request.getIsSerialized() != null) {
            category.setIsSerialized(request.getIsSerialized());
        }

        Category updatedCategory = categoryRepository.save(category);
        return stockMapper.toCategoryResponse(updatedCategory);
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));
        return stockMapper.toCategoryResponse(category);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(stockMapper::toCategoryResponse)
                .toList();
    }

    @Override
    @Transactional
    public void deleteCategory(Long categoryId) {
        if (!categoryRepository.existsById(categoryId)) {
            throw new ResourceNotFoundException("Category not found with id: " + categoryId);
        }
        categoryRepository.deleteById(categoryId);
    }
}
