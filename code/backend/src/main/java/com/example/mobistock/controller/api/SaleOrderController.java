package com.example.mobistock.controller.api;

import com.example.mobistock.common.ApiResponse;
import com.example.mobistock.common.PageResponse;
import com.example.mobistock.domain.enums.SaleStatus;
import com.example.mobistock.dto.request.CreateSaleOrderRequest;
import com.example.mobistock.dto.response.SaleOrderResponse;
import com.example.mobistock.service.SaleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/sales")
@RequiredArgsConstructor
public class SaleOrderController {

    private final SaleService saleService;

    @PostMapping
    public ResponseEntity<ApiResponse<SaleOrderResponse>> createSaleOrder(
            @Valid @RequestBody CreateSaleOrderRequest request) {
        SaleOrderResponse response = saleService.createSaleOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Sale order processed successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SaleOrderResponse>> getSaleOrderById(@PathVariable Long id) {
        SaleOrderResponse response = saleService.getSaleOrderById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/code/{saleCode}")
    public ResponseEntity<ApiResponse<SaleOrderResponse>> getSaleOrderByCode(@PathVariable String saleCode) {
        SaleOrderResponse response = saleService.getSaleOrderByCode(saleCode);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<SaleOrderResponse>>> getAllSaleOrders(
            @RequestParam(required = false) SaleStatus status,
            @PageableDefault(size = 20, sort = "saleId", direction = Sort.Direction.DESC) Pageable pageable) {
        if (status != null) {
            return ResponseEntity.ok(ApiResponse.success(
                    PageResponse.from(saleService.getSaleOrdersByStatus(status, pageable))));
        }
        return ResponseEntity.ok(ApiResponse.success(
                PageResponse.from(saleService.getAllSaleOrders(pageable))));
    }
}
