package com.example.mobistock.controller;

import com.example.mobistock.controller.api.SaleOrderController;
import com.example.mobistock.domain.enums.PaymentMethod;
import com.example.mobistock.domain.enums.SaleStatus;
import com.example.mobistock.dto.request.CreateSaleOrderRequest;
import com.example.mobistock.dto.request.PaymentRequest;
import com.example.mobistock.dto.request.SaleItemRequest;
import com.example.mobistock.dto.request.TaxInvoiceRequest;
import com.example.mobistock.dto.response.PaymentResponse;
import com.example.mobistock.dto.response.SaleOrderItemResponse;
import com.example.mobistock.dto.response.SaleOrderResponse;
import com.example.mobistock.dto.response.TaxInvoiceResponse;
import com.example.mobistock.exception.GlobalExceptionHandler;
import com.example.mobistock.exception.ResourceNotFoundException;
import com.example.mobistock.service.SaleService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SaleOrderController.class)
@Import(GlobalExceptionHandler.class)
class SaleOrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @MockitoBean
    private SaleService saleService;

    @Test
    @DisplayName("POST /api/v1/sales - Should return 201 when checkout succeeds")
    void createSaleOrder_Success() throws Exception {
        CreateSaleOrderRequest request = CreateSaleOrderRequest.builder()
                .customerId(1L)
                .cashierUserId(1L)
                .items(List.of(
                        SaleItemRequest.builder()
                                .modelId(1L)
                                .itemId(1L)
                                .quantity(1)
                                .unitPrice(new BigDecimal("41900.00"))
                                .discountAmount(new BigDecimal("1000.00"))
                                .build()
                ))
                .payment(PaymentRequest.builder()
                        .paymentMethod(PaymentMethod.TRANSFER)
                        .amount(new BigDecimal("40900.00"))
                        .build())
                .requiresTaxInvoice(true)
                .taxInvoice(TaxInvoiceRequest.builder()
                        .companyOrBuyerName("Somchai Jaidee")
                        .taxId("1409900123456")
                        .address("123 Mittraphap Rd, Khon Kaen")
                        .build())
                .build();

        SaleOrderResponse response = SaleOrderResponse.builder()
                .saleId(1L)
                .saleCode("SALE-20260915-ABCD")
                .saleDate(LocalDateTime.now())
                .customerId(1L)
                .customerName("Somchai Jaidee")
                .subtotalAmount(new BigDecimal("41900.00"))
                .discountAmount(new BigDecimal("1000.00"))
                .totalAmount(new BigDecimal("40900.00"))
                .status(SaleStatus.COMPLETED)
                .items(List.of(
                        SaleOrderItemResponse.builder()
                                .saleItemId(1L)
                                .modelName("iPhone 15 Pro")
                                .itemImei("358912345678901")
                                .unitPrice(new BigDecimal("41900.00"))
                                .discountAmount(new BigDecimal("1000.00"))
                                .subtotal(new BigDecimal("40900.00"))
                                .build()
                ))
                .payments(List.of(
                        PaymentResponse.builder()
                                .paymentId(1L)
                                .paymentMethod(PaymentMethod.TRANSFER)
                                .amount(new BigDecimal("40900.00"))
                                .build()
                ))
                .taxInvoice(TaxInvoiceResponse.builder()
                        .invoiceId(1L)
                        .invoiceNumber("INV-20260915-0001")
                        .build())
                .build();

        when(saleService.createSaleOrder(any(CreateSaleOrderRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/sales")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.saleCode").value("SALE-20260915-ABCD"))
                .andExpect(jsonPath("$.data.totalAmount").value(40900.00))
                .andExpect(jsonPath("$.data.taxInvoice.invoiceNumber").value("INV-20260915-0001"));
    }

    @Test
    @DisplayName("POST /api/v1/sales - Should return 400 when required fields are missing")
    void createSaleOrder_ValidationError() throws Exception {
        CreateSaleOrderRequest request = CreateSaleOrderRequest.builder().build();

        mockMvc.perform(post("/api/v1/sales")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"));
    }

    @Test
    @DisplayName("GET /api/v1/sales/{id} - Should return 200 when order exists")
    void getSaleOrderById_Success() throws Exception {
        SaleOrderResponse response = SaleOrderResponse.builder()
                .saleId(1L)
                .saleCode("SALE-20260915-ABCD")
                .totalAmount(new BigDecimal("40900.00"))
                .status(SaleStatus.COMPLETED)
                .build();

        when(saleService.getSaleOrderById(1L)).thenReturn(response);

        mockMvc.perform(get("/api/v1/sales/{id}", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.saleCode").value("SALE-20260915-ABCD"));
    }

    @Test
    @DisplayName("GET /api/v1/sales/{id} - Should return 404 when order does not exist")
    void getSaleOrderById_NotFound() throws Exception {
        when(saleService.getSaleOrderById(999L)).thenThrow(new ResourceNotFoundException("Sale order not found with ID: 999"));

        mockMvc.perform(get("/api/v1/sales/{id}", 999L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Sale order not found with ID: 999"));
    }

    @Test
    @DisplayName("GET /api/v1/sales/code/{saleCode} - Should return 200 when order found by code")
    void getSaleOrderByCode_Success() throws Exception {
        SaleOrderResponse response = SaleOrderResponse.builder()
                .saleId(1L)
                .saleCode("SALE-20260915-ABCD")
                .totalAmount(new BigDecimal("40900.00"))
                .status(SaleStatus.COMPLETED)
                .build();

        when(saleService.getSaleOrderByCode("SALE-20260915-ABCD")).thenReturn(response);

        mockMvc.perform(get("/api/v1/sales/code/{saleCode}", "SALE-20260915-ABCD"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.saleCode").value("SALE-20260915-ABCD"));
    }

    @Test
    @DisplayName("GET /api/v1/sales - Should return 200 with paginated orders")
    void getAllSaleOrders_Success() throws Exception {
        List<SaleOrderResponse> orders = List.of(
                SaleOrderResponse.builder().saleId(1L).saleCode("SALE-001").totalAmount(new BigDecimal("1000.00")).build()
        );
        Page<SaleOrderResponse> page = new PageImpl<>(orders, PageRequest.of(0, 20), 1);

        when(saleService.getAllSaleOrders(any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/api/v1/sales"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content.length()").value(1));
    }
}
