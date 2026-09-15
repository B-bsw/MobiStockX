package com.example.mobistock.service;

import com.example.mobistock.dto.request.CreateProductModelRequest;
import com.example.mobistock.dto.request.UpdateProductModelRequest;
import com.example.mobistock.dto.response.ProductModelResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProductModelService {
    ProductModelResponse createProductModel(CreateProductModelRequest request);
    ProductModelResponse updateProductModel(Long modelId, UpdateProductModelRequest request);
    ProductModelResponse getProductModelById(Long modelId);
    Page<ProductModelResponse> getAllProductModels(Pageable pageable);
    Page<ProductModelResponse> searchProductModels(String keyword, Pageable pageable);
    List<ProductModelResponse> getModelsByBrand(Long brandId);
    List<ProductModelResponse> getModelsByCategory(Long categoryId);
    void deleteProductModel(Long modelId);
}
