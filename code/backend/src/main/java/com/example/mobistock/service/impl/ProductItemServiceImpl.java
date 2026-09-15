package com.example.mobistock.service.impl;

import com.example.mobistock.domain.entity.ProductItem;
import com.example.mobistock.domain.entity.ProductModel;
import com.example.mobistock.domain.enums.ItemStatus;
import com.example.mobistock.dto.request.CreateProductItemRequest;
import com.example.mobistock.dto.request.UpdateProductItemStatusRequest;
import com.example.mobistock.dto.response.ProductItemResponse;
import com.example.mobistock.exception.BadRequestException;
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

        if (request.getImei() != null && productItemRepository.findByImei(request.getImei()).isPresent()) {
            throw new BadRequestException("Device with IMEI '" + request.getImei() + "' already exists");
        }

        if (request.getSerialNumber() != null && productItemRepository.findBySerialNumber(request.getSerialNumber()).isPresent()) {
            throw new BadRequestException("Device with Serial Number '" + request.getSerialNumber() + "' already exists");
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
        ProductItem item = productItemRepository.findById(itemId)
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
        return productItemRepository.findByStatus(status, pageable)
                .map(stockMapper::toProductItemResponse);
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
