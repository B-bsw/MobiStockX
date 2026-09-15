package com.example.mobistock.controller;

import com.example.mobistock.controller.api.BrandController;
import com.example.mobistock.dto.request.CreateBrandRequest;
import com.example.mobistock.dto.request.UpdateBrandRequest;
import com.example.mobistock.dto.response.BrandResponse;
import com.example.mobistock.exception.ResourceNotFoundException;
import com.example.mobistock.service.BrandService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Import;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

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

@WebMvcTest(BrandController.class)
@Import(com.example.mobistock.exception.GlobalExceptionHandler.class)
class BrandControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @MockitoBean
    private BrandService brandService;

    @Test
    @DisplayName("POST /api/v1/brands - Should return 201 when request is valid")
    void createBrand_Success() throws Exception {
        CreateBrandRequest request = CreateBrandRequest.builder()
                .brandName("Apple")
                .brandCountry("USA")
                .imageUrl("https://example.com/apple.png")
                .build();

        BrandResponse response = BrandResponse.builder()
                .brandId(1L)
                .brandName("Apple")
                .brandCountry("USA")
                .imageUrl("https://example.com/apple.png")
                .build();

        when(brandService.createBrand(any(CreateBrandRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/brands")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.brandId").value(1))
                .andExpect(jsonPath("$.data.brandName").value("Apple"))
                .andExpect(jsonPath("$.data.brandCountry").value("USA"));
    }

    @Test
    @DisplayName("POST /api/v1/brands - Should return 400 when brandName is blank")
    void createBrand_ValidationError() throws Exception {
        CreateBrandRequest request = CreateBrandRequest.builder()
                .brandName("")
                .brandCountry("USA")
                .build();

        mockMvc.perform(post("/api/v1/brands")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"));
    }

    @Test
    @DisplayName("GET /api/v1/brands/{id} - Should return 200 when brand exists")
    void getBrandById_Success() throws Exception {
        BrandResponse response = BrandResponse.builder()
                .brandId(1L)
                .brandName("Samsung")
                .brandCountry("South Korea")
                .build();

        when(brandService.getBrandById(1L)).thenReturn(response);

        mockMvc.perform(get("/api/v1/brands/{id}", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.brandName").value("Samsung"));
    }

    @Test
    @DisplayName("GET /api/v1/brands/{id} - Should return 404 when brand does not exist")
    void getBrandById_NotFound() throws Exception {
        when(brandService.getBrandById(999L)).thenThrow(new ResourceNotFoundException("Brand not found with ID: 999"));

        mockMvc.perform(get("/api/v1/brands/{id}", 999L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Brand not found with ID: 999"));
    }

    @Test
    @DisplayName("GET /api/v1/brands - Should return 200 with list of brands")
    void getAllBrands_Success() throws Exception {
        List<BrandResponse> brands = List.of(
                BrandResponse.builder().brandId(1L).brandName("Apple").build(),
                BrandResponse.builder().brandId(2L).brandName("Samsung").build()
        );

        when(brandService.getAllBrands()).thenReturn(brands);

        mockMvc.perform(get("/api/v1/brands"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(2));
    }

    @Test
    @DisplayName("PUT /api/v1/brands/{id} - Should return 200 when update is successful")
    void updateBrand_Success() throws Exception {
        UpdateBrandRequest request = UpdateBrandRequest.builder()
                .brandName("Apple Inc.")
                .brandCountry("USA")
                .build();

        BrandResponse response = BrandResponse.builder()
                .brandId(1L)
                .brandName("Apple Inc.")
                .brandCountry("USA")
                .build();

        when(brandService.updateBrand(eq(1L), any(UpdateBrandRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/v1/brands/{id}", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.brandName").value("Apple Inc."));
    }

    @Test
    @DisplayName("DELETE /api/v1/brands/{id} - Should return 204 No Content")
    void deleteBrand_Success() throws Exception {
        doNothing().when(brandService).deleteBrand(1L);

        mockMvc.perform(delete("/api/v1/brands/{id}", 1L))
                .andExpect(status().isNoContent());
    }
}
