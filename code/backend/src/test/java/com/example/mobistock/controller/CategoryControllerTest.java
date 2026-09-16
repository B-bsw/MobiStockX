package com.example.mobistock.controller;

import com.example.mobistock.controller.api.CategoryController;
import com.example.mobistock.dto.request.CreateCategoryRequest;
import com.example.mobistock.dto.request.UpdateCategoryRequest;
import com.example.mobistock.dto.response.CategoryResponse;
import com.example.mobistock.exception.GlobalExceptionHandler;
import com.example.mobistock.exception.ResourceNotFoundException;
import com.example.mobistock.service.CategoryService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
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

@WebMvcTest(CategoryController.class)
@Import(GlobalExceptionHandler.class)
class CategoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @MockitoBean
    private CategoryService categoryService;

    @Test
    @DisplayName("POST /api/v1/categories - Should return 201 when category created successfully")
    void createCategory_Success() throws Exception {
        CreateCategoryRequest request = CreateCategoryRequest.builder()
                .categoryNameTh("สมาร์ทโฟน")
                .categoryNameEn("Smartphones")
                .isSerialized(true)
                .build();

        CategoryResponse response = CategoryResponse.builder()
                .categoryId(1L)
                .categoryNameTh("สมาร์ทโฟน")
                .categoryNameEn("Smartphones")
                .isSerialized(true)
                .build();

        when(categoryService.createCategory(any(CreateCategoryRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.categoryNameTh").value("สมาร์ทโฟน"))
                .andExpect(jsonPath("$.data.categoryNameEn").value("Smartphones"));
    }

    @Test
    @DisplayName("POST /api/v1/categories - Should return 400 when categoryNameTh is blank")
    void createCategory_ValidationError() throws Exception {
        CreateCategoryRequest request = CreateCategoryRequest.builder()
                .categoryNameTh("")
                .build();

        mockMvc.perform(post("/api/v1/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"));
    }

    @Test
    @DisplayName("GET /api/v1/categories/{id} - Should return 200 when category exists")
    void getCategoryById_Success() throws Exception {
        CategoryResponse response = CategoryResponse.builder()
                .categoryId(1L)
                .categoryNameTh("สมาร์ทโฟน")
                .categoryNameEn("Smartphones")
                .isSerialized(true)
                .build();

        when(categoryService.getCategoryById(1L)).thenReturn(response);

        mockMvc.perform(get("/api/v1/categories/{id}", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.categoryNameTh").value("สมาร์ทโฟน"));
    }

    @Test
    @DisplayName("GET /api/v1/categories/{id} - Should return 404 when category not found")
    void getCategoryById_NotFound() throws Exception {
        when(categoryService.getCategoryById(999L)).thenThrow(new ResourceNotFoundException("Category not found with ID: 999"));

        mockMvc.perform(get("/api/v1/categories/{id}", 999L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Category not found with ID: 999"));
    }

    @Test
    @DisplayName("GET /api/v1/categories - Should return 200 with list of categories")
    void getAllCategories_Success() throws Exception {
        List<CategoryResponse> categories = List.of(
                CategoryResponse.builder().categoryId(1L).categoryNameTh("สมาร์ทโฟน").categoryNameEn("Smartphones").build(),
                CategoryResponse.builder().categoryId(2L).categoryNameTh("แท็บเล็ต").categoryNameEn("Tablets").build()
        );

        when(categoryService.getAllCategories()).thenReturn(categories);

        mockMvc.perform(get("/api/v1/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(2));
    }

    @Test
    @DisplayName("PUT /api/v1/categories/{id} - Should return 200 when update succeeds")
    void updateCategory_Success() throws Exception {
        UpdateCategoryRequest request = UpdateCategoryRequest.builder()
                .categoryNameTh("สมาร์ทโฟนและอุปกรณ์")
                .categoryNameEn("Smartphones & Devices")
                .isSerialized(true)
                .build();

        CategoryResponse response = CategoryResponse.builder()
                .categoryId(1L)
                .categoryNameTh("สมาร์ทโฟนและอุปกรณ์")
                .categoryNameEn("Smartphones & Devices")
                .isSerialized(true)
                .build();

        when(categoryService.updateCategory(eq(1L), any(UpdateCategoryRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/v1/categories/{id}", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.categoryNameTh").value("สมาร์ทโฟนและอุปกรณ์"));
    }

    @Test
    @DisplayName("DELETE /api/v1/categories/{id} - Should return 204 No Content")
    void deleteCategory_Success() throws Exception {
        doNothing().when(categoryService).deleteCategory(1L);

        mockMvc.perform(delete("/api/v1/categories/{id}", 1L))
                .andExpect(status().isNoContent());
    }
}
