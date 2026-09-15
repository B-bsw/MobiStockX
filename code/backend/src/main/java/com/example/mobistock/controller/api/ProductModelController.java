package com.example.mobistock.controller.api;

import com.example.mobistock.common.ApiResponse;
import com.example.mobistock.common.PageResponse;
import com.example.mobistock.dto.request.CreateProductModelRequest;
import com.example.mobistock.dto.request.UpdateProductModelRequest;
import com.example.mobistock.dto.response.ProductModelResponse;
import com.example.mobistock.service.ProductModelService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products/models")
@RequiredArgsConstructor
public class ProductModelController {

    private final ProductModelService productModelService;

    @PostMapping
    public ResponseEntity<ApiResponse<ProductModelResponse>> createProductModel(
            @Valid @RequestBody CreateProductModelRequest request) {
        ProductModelResponse response = productModelService.createProductModel(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Product model created successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductModelResponse>> getProductModelById(@PathVariable Long id) {
        ProductModelResponse response = productModelService.getProductModelById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ProductModelResponse>>> getAllProductModels(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "modelId", direction = Sort.Direction.DESC) Pageable pageable) {
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(ApiResponse.success(
                    PageResponse.from(productModelService.searchProductModels(search.trim(), pageable))));
        }
        return ResponseEntity.ok(ApiResponse.success(
                PageResponse.from(productModelService.getAllProductModels(pageable))));
    }

    @GetMapping("/brand/{brandId}")
    public ResponseEntity<ApiResponse<List<ProductModelResponse>>> getModelsByBrand(@PathVariable Long brandId) {
        List<ProductModelResponse> response = productModelService.getModelsByBrand(brandId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ApiResponse<List<ProductModelResponse>>> getModelsByCategory(@PathVariable Long categoryId) {
        List<ProductModelResponse> response = productModelService.getModelsByCategory(categoryId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductModelResponse>> updateProductModel(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProductModelRequest request) {
        ProductModelResponse response = productModelService.updateProductModel(id, request);
        return ResponseEntity.ok(ApiResponse.success("Product model updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProductModel(@PathVariable Long id) {
        productModelService.deleteProductModel(id);
        return ResponseEntity.noContent().build();
    }
}
