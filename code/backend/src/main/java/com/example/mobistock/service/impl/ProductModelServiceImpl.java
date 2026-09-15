package com.example.mobistock.service.impl;

import com.example.mobistock.domain.entity.Brand;
import com.example.mobistock.domain.entity.Category;
import com.example.mobistock.domain.entity.ProductModel;
import com.example.mobistock.dto.request.CreateProductModelRequest;
import com.example.mobistock.dto.request.UpdateProductModelRequest;
import com.example.mobistock.dto.response.ProductModelResponse;
import com.example.mobistock.exception.ResourceNotFoundException;
import com.example.mobistock.mapper.StockMapper;
import com.example.mobistock.repository.BrandRepository;
import com.example.mobistock.repository.CategoryRepository;
import com.example.mobistock.repository.ProductModelRepository;
import com.example.mobistock.service.ProductModelService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductModelServiceImpl implements ProductModelService {

    private final ProductModelRepository productModelRepository;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final StockMapper stockMapper;

    @Override
    @Transactional
    public ProductModelResponse createProductModel(CreateProductModelRequest request) {
        Brand brand = brandRepository.findById(request.getBrandId())
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + request.getBrandId()));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        ProductModel model = stockMapper.toProductModelEntity(request, brand, category);
        if (model.getStandardCost() == null) {
            model.setStandardCost(BigDecimal.ZERO);
        }
        ProductModel savedModel = productModelRepository.save(model);
        return stockMapper.toProductModelResponse(savedModel);
    }

    @Override
    @Transactional
    public ProductModelResponse updateProductModel(Long modelId, UpdateProductModelRequest request) {
        ProductModel model = productModelRepository.findById(modelId)
                .orElseThrow(() -> new ResourceNotFoundException("Product model not found with id: " + modelId));

        Brand brand = brandRepository.findById(request.getBrandId())
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + request.getBrandId()));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        model.setModelName(request.getModelName());
        model.setColor(request.getColor());
        model.setStorageCapacity(request.getStorageCapacity());
        model.setModelWarrantyDuration(request.getModelWarrantyDuration());
        if (request.getIsSerialized() != null) {
            model.setIsSerialized(request.getIsSerialized());
        }
        model.setStandardCost(request.getStandardCost() != null ? request.getStandardCost() : BigDecimal.ZERO);
        model.setStandardPrice(request.getStandardPrice());
        model.setImageUrl(request.getImageUrl());
        model.setBrand(brand);
        model.setCategory(category);

        ProductModel updatedModel = productModelRepository.save(model);
        return stockMapper.toProductModelResponse(updatedModel);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductModelResponse getProductModelById(Long modelId) {
        ProductModel model = productModelRepository.findById(modelId)
                .orElseThrow(() -> new ResourceNotFoundException("Product model not found with id: " + modelId));
        return stockMapper.toProductModelResponse(model);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductModelResponse> getAllProductModels(Pageable pageable) {
        return productModelRepository.findAll(pageable)
                .map(stockMapper::toProductModelResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductModelResponse> searchProductModels(String keyword, Pageable pageable) {
        return productModelRepository.findByModelNameContainingIgnoreCase(keyword, pageable)
                .map(stockMapper::toProductModelResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductModelResponse> getModelsByBrand(Long brandId) {
        return productModelRepository.findByBrandBrandId(brandId).stream()
                .map(stockMapper::toProductModelResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductModelResponse> getModelsByCategory(Long categoryId) {
        return productModelRepository.findByCategoryCategoryId(categoryId).stream()
                .map(stockMapper::toProductModelResponse)
                .toList();
    }

    @Override
    @Transactional
    public void deleteProductModel(Long modelId) {
        if (!productModelRepository.existsById(modelId)) {
            throw new ResourceNotFoundException("Product model not found with id: " + modelId);
        }
        productModelRepository.deleteById(modelId);
    }
}
