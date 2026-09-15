package com.example.mobistock.mapper;

import com.example.mobistock.domain.entity.Brand;
import com.example.mobistock.domain.entity.Category;
import com.example.mobistock.domain.entity.ProductItem;
import com.example.mobistock.domain.entity.ProductModel;
import com.example.mobistock.dto.request.CreateBrandRequest;
import com.example.mobistock.dto.request.CreateCategoryRequest;
import com.example.mobistock.dto.request.CreateProductItemRequest;
import com.example.mobistock.dto.request.CreateProductModelRequest;
import com.example.mobistock.dto.response.BrandResponse;
import com.example.mobistock.dto.response.CategoryResponse;
import com.example.mobistock.dto.response.ProductItemResponse;
import com.example.mobistock.dto.response.ProductModelResponse;
import org.springframework.stereotype.Component;

@Component
public class StockMapper {

    public Brand toBrandEntity(CreateBrandRequest request) {
        return Brand.builder()
                .brandName(request.getBrandName())
                .brandCountry(request.getBrandCountry())
                .imageUrl(request.getImageUrl())
                .build();
    }

    public BrandResponse toBrandResponse(Brand brand) {
        return BrandResponse.builder()
                .brandId(brand.getBrandId())
                .brandName(brand.getBrandName())
                .brandCountry(brand.getBrandCountry())
                .imageUrl(brand.getImageUrl())
                .createdAt(brand.getCreatedAt())
                .updatedAt(brand.getUpdatedAt())
                .build();
    }

    public Category toCategoryEntity(CreateCategoryRequest request) {
        return Category.builder()
                .categoryNameTh(request.getCategoryNameTh())
                .categoryNameEn(request.getCategoryNameEn())
                .isSerialized(request.getIsSerialized() != null ? request.getIsSerialized() : true)
                .build();
    }

    public CategoryResponse toCategoryResponse(Category category) {
        return CategoryResponse.builder()
                .categoryId(category.getCategoryId())
                .categoryNameTh(category.getCategoryNameTh())
                .categoryNameEn(category.getCategoryNameEn())
                .isSerialized(category.getIsSerialized())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }

    public ProductModel toProductModelEntity(CreateProductModelRequest request, Brand brand, Category category) {
        return ProductModel.builder()
                .modelName(request.getModelName())
                .color(request.getColor())
                .storageCapacity(request.getStorageCapacity())
                .modelWarrantyDuration(request.getModelWarrantyDuration())
                .isSerialized(request.getIsSerialized())
                .standardCost(request.getStandardCost())
                .standardPrice(request.getStandardPrice())
                .imageUrl(request.getImageUrl())
                .stockQuantity(0)
                .brand(brand)
                .category(category)
                .build();
    }

    public ProductModelResponse toProductModelResponse(ProductModel model) {
        return ProductModelResponse.builder()
                .modelId(model.getModelId())
                .modelName(model.getModelName())
                .color(model.getColor())
                .storageCapacity(model.getStorageCapacity())
                .modelWarrantyDuration(model.getModelWarrantyDuration())
                .isSerialized(model.getIsSerialized())
                .stockQuantity(model.getStockQuantity())
                .standardCost(model.getStandardCost())
                .standardPrice(model.getStandardPrice())
                .imageUrl(model.getImageUrl())
                .brandId(model.getBrand().getBrandId())
                .brandName(model.getBrand().getBrandName())
                .categoryId(model.getCategory().getCategoryId())
                .categoryNameTh(model.getCategory().getCategoryNameTh())
                .createdAt(model.getCreatedAt())
                .updatedAt(model.getUpdatedAt())
                .build();
    }

    public ProductItem toProductItemEntity(CreateProductItemRequest request, ProductModel model) {
        return ProductItem.builder()
                .productModel(model)
                .serialNumber(request.getSerialNumber())
                .imei(request.getImei())
                .condition(request.getCondition())
                .grade(request.getGrade())
                .batteryHealth(request.getBatteryHealth())
                .costPrice(request.getCostPrice())
                .sellingPrice(request.getSellingPrice())
                .warrantyExpireDate(request.getWarrantyExpireDate())
                .build();
    }

    public ProductItemResponse toProductItemResponse(ProductItem item) {
        return ProductItemResponse.builder()
                .itemId(item.getItemId())
                .modelId(item.getProductModel().getModelId())
                .modelName(item.getProductModel().getModelName())
                .serialNumber(item.getSerialNumber())
                .imei(item.getImei())
                .condition(item.getCondition())
                .grade(item.getGrade())
                .batteryHealth(item.getBatteryHealth())
                .costPrice(item.getCostPrice())
                .sellingPrice(item.getSellingPrice())
                .status(item.getStatus())
                .warrantyExpireDate(item.getWarrantyExpireDate())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }
}
