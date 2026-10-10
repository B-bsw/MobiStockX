package com.example.mobistock.service.impl;

import com.example.mobistock.domain.entity.ProductItem;
import com.example.mobistock.domain.entity.ProductModel;
import com.example.mobistock.domain.enums.ItemStatus;
import com.example.mobistock.dto.request.CreateProductItemRequest;
import com.example.mobistock.dto.request.UpdateProductItemRequest;
import com.example.mobistock.dto.request.UpdateProductItemStatusRequest;
import com.example.mobistock.dto.response.ProductItemResponse;
import com.example.mobistock.exception.BadRequestException;
import com.example.mobistock.exception.ConflictException;
import com.example.mobistock.exception.ResourceNotFoundException;
import com.example.mobistock.mapper.StockMapper;
import com.example.mobistock.repository.ProductItemRepository;
import com.example.mobistock.repository.ProductModelRepository;
import com.example.mobistock.service.ProductItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductItemServiceImpl implements ProductItemService {

    private final ProductItemRepository productItemRepository;
    private final ProductModelRepository productModelRepository;
    private final StockMapper stockMapper;

    @Override
    @Transactional
    public ProductItemResponse createProductItem(CreateProductItemRequest request) {
        ProductModel model = productModelRepository.findById(request.getModelId())
                .orElseThrow(() -> new ResourceNotFoundException("Product model not found with id: " + request.getModelId()));

        if (request.getImei() != null && productItemRepository.existsByImei(request.getImei())) {
            throw new ConflictException("Device with IMEI '" + request.getImei() + "' already exists");
        }

        if (request.getSerialNumber() != null && productItemRepository.existsBySerialNumber(request.getSerialNumber())) {
            throw new ConflictException("Device with Serial Number '" + request.getSerialNumber() + "' already exists");
        }

        ProductItem item = stockMapper.toProductItemEntity(request, model);
        item.setStatus(ItemStatus.AVAILABLE);

        ProductItem savedItem = productItemRepository.save(item);

        model.setStockQuantity(model.getStockQuantity() + 1);
        productModelRepository.save(model);

        return stockMapper.toProductItemResponse(savedItem);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductItemResponse getProductItemById(Long itemId) {
        ProductItem item = productItemRepository.findWithModelByItemId(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Product item not found with id: " + itemId));
        return stockMapper.toProductItemResponse(item);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductItemResponse getProductItemByImei(String imei) {
        ProductItem item = productItemRepository.findByImei(imei)
                .orElseThrow(() -> new ResourceNotFoundException("Product item not found with IMEI: " + imei));
        return stockMapper.toProductItemResponse(item);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductItemResponse getProductItemBySerialNumber(String serialNumber) {
        ProductItem item = productItemRepository.findBySerialNumber(serialNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Product item not found with Serial Number: " + serialNumber));
        return stockMapper.toProductItemResponse(item);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductItemResponse> getItemsByModelAndStatus(Long modelId, ItemStatus status) {
        return productItemRepository.findByProductModelModelIdAndStatus(modelId, status).stream()
                .map(stockMapper::toProductItemResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductItemResponse> getItemsByStatus(ItemStatus status, Pageable pageable) {
        Page<ProductItem> page = status == null
                ? productItemRepository.findAll(pageable)
                : productItemRepository.findByStatus(status, pageable);

        return page.map(stockMapper::toProductItemResponse);
    }

    @Override
    @Transactional
    public ProductItemResponse updateItemStatus(Long itemId, UpdateProductItemStatusRequest request) {
        ProductItem item = productItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Product item not found with id: " + itemId));

        ItemStatus oldStatus = item.getStatus();
        ItemStatus newStatus = request.getStatus();

        if (oldStatus != newStatus) {
            item.setStatus(newStatus);
            ProductModel model = item.getProductModel();

            if (oldStatus == ItemStatus.AVAILABLE && newStatus != ItemStatus.AVAILABLE) {
                model.setStockQuantity(Math.max(0, model.getStockQuantity() - 1));
                productModelRepository.save(model);
            } else if (oldStatus != ItemStatus.AVAILABLE && newStatus == ItemStatus.AVAILABLE) {
                model.setStockQuantity(model.getStockQuantity() + 1);
                productModelRepository.save(model);
            }
        }

        ProductItem updatedItem = productItemRepository.save(item);
        return stockMapper.toProductItemResponse(updatedItem);
    }

    @Override
    @Transactional
    public ProductItemResponse updateProductItem(Long itemId, UpdateProductItemRequest request) {
        ProductItem item = productItemRepository.findWithModelByItemId(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Product item not found with id: " + itemId));

        String serialNumber = normalize(request.getSerialNumber());
        String imei = normalize(request.getImei());

        if (imei != null && productItemRepository.existsByImeiAndItemIdNot(imei, itemId)) {
            throw new ConflictException("Device with IMEI '" + imei + "' already exists");
        }

        if (serialNumber != null && productItemRepository.existsBySerialNumberAndItemIdNot(serialNumber, itemId)) {
            throw new ConflictException("Device with Serial Number '" + serialNumber + "' already exists");
        }

        if (item.getStatus() == ItemStatus.SOLD && request.getStatus() != ItemStatus.SOLD) {
            throw new BadRequestException("A sold item cannot be returned to stock by editing; use a claim or return instead");
        }

        item.setSerialNumber(serialNumber);
        item.setImei(imei);
        item.setGrade(normalize(request.getGrade()));
        item.setBatteryHealth(request.getBatteryHealth());
        item.setCostPrice(request.getCostPrice());
        item.setSellingPrice(request.getSellingPrice());

        if (request.getCondition() != null) {
            item.setCondition(request.getCondition());
        }

        applyStatusChange(item, request.getStatus());

        return stockMapper.toProductItemResponse(productItemRepository.save(item));
    }

    private void applyStatusChange(ProductItem item, ItemStatus newStatus) {
        ItemStatus oldStatus = item.getStatus();
        if (oldStatus == newStatus) {
            return;
        }

        item.setStatus(newStatus);
        ProductModel model = item.getProductModel();

        if (oldStatus == ItemStatus.AVAILABLE) {
            model.setStockQuantity(Math.max(0, model.getStockQuantity() - 1));
            productModelRepository.save(model);
        } else if (newStatus == ItemStatus.AVAILABLE) {
            model.setStockQuantity(model.getStockQuantity() + 1);
            productModelRepository.save(model);
        }
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    @Override
    @Transactional
    public void deleteProductItem(Long itemId) {
        ProductItem item = productItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Product item not found with id: " + itemId));

        if (item.getStatus() == ItemStatus.AVAILABLE) {
            ProductModel model = item.getProductModel();
            model.setStockQuantity(Math.max(0, model.getStockQuantity() - 1));
            productModelRepository.save(model);
        }

        productItemRepository.delete(item);
    }
}
