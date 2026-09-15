package com.example.mobistock.controller.api;

import com.example.mobistock.common.ApiResponse;
import com.example.mobistock.common.PageResponse;
import com.example.mobistock.domain.enums.ItemStatus;
import com.example.mobistock.dto.request.CreateProductItemRequest;
import com.example.mobistock.dto.request.UpdateProductItemStatusRequest;
import com.example.mobistock.dto.response.ProductItemResponse;
import com.example.mobistock.service.ProductItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products/items")
@RequiredArgsConstructor
public class ProductItemController {

    private final ProductItemService productItemService;

    @PostMapping
    public ResponseEntity<ApiResponse<ProductItemResponse>> createProductItem(
            @Valid @RequestBody CreateProductItemRequest request) {
        ProductItemResponse response = productItemService.createProductItem(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Product item added to inventory successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductItemResponse>> getProductItemById(@PathVariable Long id) {
        ProductItemResponse response = productItemService.getProductItemById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/imei/{imei}")
    public ResponseEntity<ApiResponse<ProductItemResponse>> getProductItemByImei(@PathVariable String imei) {
        ProductItemResponse response = productItemService.getProductItemByImei(imei);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/serial/{serialNumber}")
    public ResponseEntity<ApiResponse<ProductItemResponse>> getProductItemBySerialNumber(@PathVariable String serialNumber) {
        ProductItemResponse response = productItemService.getProductItemBySerialNumber(serialNumber);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/model/{modelId}")
    public ResponseEntity<ApiResponse<List<ProductItemResponse>>> getItemsByModelAndStatus(
            @PathVariable Long modelId,
            @RequestParam(defaultValue = "AVAILABLE") ItemStatus status) {
        List<ProductItemResponse> response = productItemService.getItemsByModelAndStatus(modelId, status);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ProductItemResponse>>> getItemsByStatus(
            @RequestParam(defaultValue = "AVAILABLE") ItemStatus status,
            @PageableDefault(size = 20, sort = "itemId", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                PageResponse.from(productItemService.getItemsByStatus(status, pageable))));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ProductItemResponse>> updateItemStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProductItemStatusRequest request) {
        ProductItemResponse response = productItemService.updateItemStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success("Item status updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProductItem(@PathVariable Long id) {
        productItemService.deleteProductItem(id);
        return ResponseEntity.noContent().build();
    }
}
