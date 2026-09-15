package com.example.mobistock.controller;

import com.example.mobistock.controller.api.ProductModelController;
import com.example.mobistock.dto.request.CreateProductModelRequest;
import com.example.mobistock.dto.request.UpdateProductModelRequest;
import com.example.mobistock.dto.response.ProductModelResponse;
import com.example.mobistock.exception.GlobalExceptionHandler;
import com.example.mobistock.exception.ResourceNotFoundException;
import com.example.mobistock.service.ProductModelService;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProductModelController.class)
@Import(GlobalExceptionHandler.class)
class ProductModelControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @MockitoBean
    private ProductModelService productModelService;

    @Test
    @DisplayName("POST /api/v1/products/models - Should return 201 when product model created successfully")
    void createProductModel_Success() throws Exception {
        CreateProductModelRequest request = CreateProductModelRequest.builder()
                .modelName("iPhone 15 Pro")
                .color("Natural Titanium")
                .storageCapacity("256GB")
                .modelWarrantyDuration(12)
                .isSerialized(true)
                .standardCost(new BigDecimal("35000.00"))
                .standardPrice(new BigDecimal("41900.00"))
                .brandId(1L)
                .categoryId(1L)
                .build();

        ProductModelResponse response = ProductModelResponse.builder()
                .modelId(1L)
                .modelName("iPhone 15 Pro")
                .color("Natural Titanium")
                .storageCapacity("256GB")
                .modelWarrantyDuration(12)
                .isSerialized(true)
                .stockQuantity(10)
                .standardCost(new BigDecimal("35000.00"))
                .standardPrice(new BigDecimal("41900.00"))
                .brandId(1L)
                .brandName("Apple")
                .categoryId(1L)
                .categoryNameTh("สมาร์ทโฟน")
                .build();

        when(productModelService.createProductModel(any(CreateProductModelRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/products/models")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.modelName").value("iPhone 15 Pro"))
                .andExpect(jsonPath("$.data.standardPrice").value(41900.00));
    }

    @Test
    @DisplayName("POST /api/v1/products/models - Should return 400 when validation fails")
    void createProductModel_ValidationError() throws Exception {
        CreateProductModelRequest request = CreateProductModelRequest.builder()
                .modelName("")
                .standardPrice(null)
                .build();

        mockMvc.perform(post("/api/v1/products/models")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"));
    }

    @Test
    @DisplayName("GET /api/v1/products/models/{id} - Should return 200 when product model exists")
    void getProductModelById_Success() throws Exception {
        ProductModelResponse response = ProductModelResponse.builder()
                .modelId(1L)
                .modelName("iPhone 15 Pro")
                .standardPrice(new BigDecimal("41900.00"))
                .build();

        when(productModelService.getProductModelById(1L)).thenReturn(response);

        mockMvc.perform(get("/api/v1/products/models/{id}", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.modelName").value("iPhone 15 Pro"));
    }

    @Test
    @DisplayName("GET /api/v1/products/models/{id} - Should return 404 when product model not found")
    void getProductModelById_NotFound() throws Exception {
        when(productModelService.getProductModelById(999L))
                .thenThrow(new ResourceNotFoundException("Product model not found with ID: 999"));

        mockMvc.perform(get("/api/v1/products/models/{id}", 999L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Product model not found with ID: 999"));
    }

    @Test
    @DisplayName("GET /api/v1/products/models - Should return 200 with paginated product models")
    void getAllProductModels_Success() throws Exception {
        List<ProductModelResponse> models = List.of(
                ProductModelResponse.builder().modelId(1L).modelName("iPhone 15 Pro").build(),
                ProductModelResponse.builder().modelId(2L).modelName("Galaxy S24 Ultra").build()
        );
        Page<ProductModelResponse> page = new PageImpl<>(models);

        when(productModelService.getAllProductModels(any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/api/v1/products/models"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content.length()").value(2))
                .andExpect(jsonPath("$.data.totalElements").value(2));
    }

    @Test
    @DisplayName("GET /api/v1/products/models/brand/{brandId} - Should return 200 with models by brand")
    void getModelsByBrand_Success() throws Exception {
        List<ProductModelResponse> models = List.of(
                ProductModelResponse.builder().modelId(1L).modelName("iPhone 15 Pro").brandId(1L).build()
        );

        when(productModelService.getModelsByBrand(1L)).thenReturn(models);

        mockMvc.perform(get("/api/v1/products/models/brand/{brandId}", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(1));
    }

    @Test
    @DisplayName("GET /api/v1/products/models/category/{categoryId} - Should return 200 with models by category")
    void getModelsByCategory_Success() throws Exception {
        List<ProductModelResponse> models = List.of(
                ProductModelResponse.builder().modelId(1L).modelName("iPhone 15 Pro").categoryId(1L).build()
        );

        when(productModelService.getModelsByCategory(1L)).thenReturn(models);

        mockMvc.perform(get("/api/v1/products/models/category/{categoryId}", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(1));
    }

    @Test
    @DisplayName("PUT /api/v1/products/models/{id} - Should return 200 when update succeeds")
    void updateProductModel_Success() throws Exception {
        UpdateProductModelRequest request = UpdateProductModelRequest.builder()
                .modelName("iPhone 15 Pro Max")
                .color("Black Titanium")
                .storageCapacity("512GB")
                .standardCost(new BigDecimal("39000.00"))
                .standardPrice(new BigDecimal("48900.00"))
                .brandId(1L)
                .categoryId(1L)
                .build();

        ProductModelResponse response = ProductModelResponse.builder()
                .modelId(1L)
                .modelName("iPhone 15 Pro Max")
                .standardPrice(new BigDecimal("48900.00"))
                .build();

        when(productModelService.updateProductModel(eq(1L), any(UpdateProductModelRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/v1/products/models/{id}", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.modelName").value("iPhone 15 Pro Max"));
    }

    @Test
    @DisplayName("DELETE /api/v1/products/models/{id} - Should return 204 No Content")
    void deleteProductModel_Success() throws Exception {
        doNothing().when(productModelService).deleteProductModel(1L);

        mockMvc.perform(delete("/api/v1/products/models/{id}", 1L))
                .andExpect(status().isNoContent());
    }
}
