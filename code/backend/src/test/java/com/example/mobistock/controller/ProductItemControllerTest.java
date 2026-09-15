package com.example.mobistock.controller;

import com.example.mobistock.controller.api.ProductItemController;
import com.example.mobistock.domain.enums.ItemCondition;
import com.example.mobistock.domain.enums.ItemStatus;
import com.example.mobistock.dto.request.CreateProductItemRequest;
import com.example.mobistock.dto.request.UpdateProductItemStatusRequest;
import com.example.mobistock.dto.response.ProductItemResponse;
import com.example.mobistock.exception.GlobalExceptionHandler;
import com.example.mobistock.exception.ResourceNotFoundException;
import com.example.mobistock.service.ProductItemService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProductItemController.class)
@Import(GlobalExceptionHandler.class)
class ProductItemControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @MockitoBean
    private ProductItemService productItemService;

    @Test
    @DisplayName("POST /api/v1/products/items - Should return 201 when product item created successfully")
    void createProductItem_Success() throws Exception {
        CreateProductItemRequest request = CreateProductItemRequest.builder()
                .modelId(1L)
                .imei("358912345678901")
                .serialNumber("SN-IP15P-001")
                .condition(ItemCondition.NEW)
                .costPrice(new BigDecimal("35000.00"))
                .sellingPrice(new BigDecimal("41900.00"))
                .build();

        ProductItemResponse response = ProductItemResponse.builder()
                .itemId(1L)
                .modelId(1L)
                .modelName("iPhone 15 Pro")
                .imei("358912345678901")
                .serialNumber("SN-IP15P-001")
                .condition(ItemCondition.NEW)
                .costPrice(new BigDecimal("35000.00"))
                .sellingPrice(new BigDecimal("41900.00"))
                .status(ItemStatus.AVAILABLE)
                .build();

        when(productItemService.createProductItem(any(CreateProductItemRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/products/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.imei").value("358912345678901"))
                .andExpect(jsonPath("$.data.serialNumber").value("SN-IP15P-001"));
    }

    @Test
    @DisplayName("POST /api/v1/products/items - Should return 400 when modelId or prices are invalid")
    void createProductItem_ValidationError() throws Exception {
        CreateProductItemRequest request = CreateProductItemRequest.builder()
                .modelId(null)
                .costPrice(new BigDecimal("-100"))
                .build();

        mockMvc.perform(post("/api/v1/products/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"));
    }

    @Test
    @DisplayName("GET /api/v1/products/items/{id} - Should return 200 when item exists")
    void getProductItemById_Success() throws Exception {
        ProductItemResponse response = ProductItemResponse.builder()
                .itemId(1L)
                .modelName("iPhone 15 Pro")
                .imei("358912345678901")
                .status(ItemStatus.AVAILABLE)
                .build();

        when(productItemService.getProductItemById(1L)).thenReturn(response);

        mockMvc.perform(get("/api/v1/products/items/{id}", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.itemId").value(1L))
                .andExpect(jsonPath("$.data.imei").value("358912345678901"));
    }

    @Test
    @DisplayName("GET /api/v1/products/items/{id} - Should return 404 when item not found")
    void getProductItemById_NotFound() throws Exception {
        when(productItemService.getProductItemById(999L))
                .thenThrow(new ResourceNotFoundException("Product item not found with ID: 999"));

        mockMvc.perform(get("/api/v1/products/items/{id}", 999L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Product item not found with ID: 999"));
    }

    @Test
    @DisplayName("GET /api/v1/products/items/imei/{imei} - Should return 200 when IMEI exists")
    void getProductItemByImei_Success() throws Exception {
        ProductItemResponse response = ProductItemResponse.builder()
                .itemId(1L)
                .imei("358912345678901")
                .status(ItemStatus.AVAILABLE)
                .build();

        when(productItemService.getProductItemByImei("358912345678901")).thenReturn(response);

        mockMvc.perform(get("/api/v1/products/items/imei/{imei}", "358912345678901"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.imei").value("358912345678901"));
    }

    @Test
    @DisplayName("GET /api/v1/products/items/serial/{serialNumber} - Should return 200 when serial number exists")
    void getProductItemBySerialNumber_Success() throws Exception {
        ProductItemResponse response = ProductItemResponse.builder()
                .itemId(1L)
                .serialNumber("SN-IP15P-001")
                .status(ItemStatus.AVAILABLE)
                .build();

        when(productItemService.getProductItemBySerialNumber("SN-IP15P-001")).thenReturn(response);

        mockMvc.perform(get("/api/v1/products/items/serial/{serialNumber}", "SN-IP15P-001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.serialNumber").value("SN-IP15P-001"));
    }

    @Test
    @DisplayName("GET /api/v1/products/items - Should return 200 with paginated items")
    void getItemsByStatus_Success() throws Exception {
        List<ProductItemResponse> items = List.of(
                ProductItemResponse.builder().itemId(1L).imei("358912345678901").status(ItemStatus.AVAILABLE).build(),
                ProductItemResponse.builder().itemId(2L).imei("358912345678902").status(ItemStatus.AVAILABLE).build()
        );
        Page<ProductItemResponse> page = new PageImpl<>(items);

        when(productItemService.getItemsByStatus(eq(ItemStatus.AVAILABLE), any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/api/v1/products/items?status=AVAILABLE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content.length()").value(2));
    }

    @Test
    @DisplayName("PATCH /api/v1/products/items/{id}/status - Should return 200 when status updated")
    void updateItemStatus_Success() throws Exception {
        UpdateProductItemStatusRequest request = UpdateProductItemStatusRequest.builder()
                .status(ItemStatus.DAMAGED)
                .build();

        ProductItemResponse response = ProductItemResponse.builder()
                .itemId(1L)
                .status(ItemStatus.DAMAGED)
                .build();

        when(productItemService.updateItemStatus(eq(1L), any(UpdateProductItemStatusRequest.class))).thenReturn(response);

        mockMvc.perform(patch("/api/v1/products/items/{id}/status", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("DAMAGED"));
    }

    @Test
    @DisplayName("DELETE /api/v1/products/items/{id} - Should return 204 No Content")
    void deleteProductItem_Success() throws Exception {
        doNothing().when(productItemService).deleteProductItem(1L);

        mockMvc.perform(delete("/api/v1/products/items/{id}", 1L))
                .andExpect(status().isNoContent());
    }
}
