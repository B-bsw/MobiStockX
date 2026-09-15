package com.example.mobistock.service;

import com.example.mobistock.domain.enums.ItemStatus;
import com.example.mobistock.dto.request.CreateProductItemRequest;
import com.example.mobistock.dto.request.UpdateProductItemStatusRequest;
import com.example.mobistock.dto.response.ProductItemResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProductItemService {
    ProductItemResponse createProductItem(CreateProductItemRequest request);
    ProductItemResponse getProductItemById(Long itemId);
    ProductItemResponse getProductItemByImei(String imei);
    ProductItemResponse getProductItemBySerialNumber(String serialNumber);
    List<ProductItemResponse> getItemsByModelAndStatus(Long modelId, ItemStatus status);
    Page<ProductItemResponse> getItemsByStatus(ItemStatus status, Pageable pageable);
    ProductItemResponse updateItemStatus(Long itemId, UpdateProductItemStatusRequest request);
    void deleteProductItem(Long itemId);
}
