package com.example.mobistock.service;

import com.example.mobistock.dto.request.CreateCategoryRequest;
import com.example.mobistock.dto.request.UpdateCategoryRequest;
import com.example.mobistock.dto.response.CategoryResponse;

import java.util.List;

public interface CategoryService {
    CategoryResponse createCategory(CreateCategoryRequest request);
    CategoryResponse updateCategory(Long categoryId, UpdateCategoryRequest request);
    CategoryResponse getCategoryById(Long categoryId);
    List<CategoryResponse> getAllCategories();
    void deleteCategory(Long categoryId);
}
