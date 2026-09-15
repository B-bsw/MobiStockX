package com.example.mobistock.service;

import com.example.mobistock.domain.enums.SaleStatus;
import com.example.mobistock.dto.request.CreateSaleOrderRequest;
import com.example.mobistock.dto.response.SaleOrderResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SaleService {
    SaleOrderResponse createSaleOrder(CreateSaleOrderRequest request);
    SaleOrderResponse getSaleOrderById(Long saleId);
    SaleOrderResponse getSaleOrderByCode(String saleCode);
    Page<SaleOrderResponse> getAllSaleOrders(Pageable pageable);
    Page<SaleOrderResponse> getSaleOrdersByStatus(SaleStatus status, Pageable pageable);
}
