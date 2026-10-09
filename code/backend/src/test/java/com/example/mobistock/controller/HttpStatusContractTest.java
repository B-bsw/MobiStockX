package com.example.mobistock.controller;

import com.example.mobistock.controller.api.BrandController;
import com.example.mobistock.dto.response.BrandResponse;
import com.example.mobistock.exception.GlobalExceptionHandler;
import com.example.mobistock.exception.ResourceNotFoundException;
import com.example.mobistock.service.BrandService;
import com.example.mobistock.support.TestSecurityBeans;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// HTTP semantics: RFC 9110 sections 15.3, 15.5 and 15.6.
// This slice deliberately injects exceptions to exercise the real exception handler.
@WebMvcTest(BrandController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import({GlobalExceptionHandler.class, TestSecurityBeans.class})
class HttpStatusContractTest {
    @Autowired MockMvc mvc;
    @MockitoBean BrandService brands;

    private BrandResponse response() {
        return BrandResponse.builder().brandId(1L).brandName("HTTPBrand").build();
    }

    @Test
    @DisplayName("HTTP GET อ่านข้อมูลสำเร็จต้องตอบ 200")
    void getReturns200() throws Exception {
        when(brands.getBrandById(1L)).thenReturn(response());
        mvc.perform(get("/api/v1/brands/1")).andExpect(status().isOk())
                .andExpect(jsonPath("$.data.brandId").value(1));
        verify(brands).getBrandById(1L);
    }

    @Test
    @DisplayName("HTTP POST สร้างข้อมูลสำเร็จต้องตอบ 201")
    void postReturns201() throws Exception {
        when(brands.createBrand(any())).thenReturn(response());
        mvc.perform(post("/api/v1/brands").contentType(MediaType.APPLICATION_JSON).content("{\"brandName\":\"HTTPBrand\"}"))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.data.brandId").value(1));
        verify(brands).createBrand(any());
    }

    @Test
    @DisplayName("HTTP PUT แก้ไขข้อมูลสำเร็จพร้อม response body ต้องตอบ 200")
    void putReturns200() throws Exception {
        when(brands.updateBrand(eq(1L), any())).thenReturn(response());
        mvc.perform(put("/api/v1/brands/1").contentType(MediaType.APPLICATION_JSON).content("{\"brandName\":\"HTTPBrand\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.brandId").value(1));
        verify(brands).updateBrand(eq(1L), any());
    }

    @Test
    @DisplayName("HTTP DELETE สำเร็จต้องตอบ 204 และไม่มี response body")
    void deleteReturns204WithoutBody() throws Exception {
        mvc.perform(delete("/api/v1/brands/1")).andExpect(status().isNoContent()).andExpect(content().string(""));
        verify(brands).deleteBrand(1L);
    }

    @Test
    @DisplayName("HTTP POST ข้อมูลไม่ผ่าน validation ต้องตอบ 400 และไม่เรียก service")
    void invalidFieldsReturn400() throws Exception {
        mvc.perform(post("/api/v1/brands").contentType(MediaType.APPLICATION_JSON).content("{\"brandName\":\" \"}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.status").value(400));
        verifyNoInteractions(brands);
    }

    @Test
    @DisplayName("HTTP POST JSON เสียรูปแบบต้องตอบ 400 ไม่ใช่ 500")
    void malformedJsonReturns400() throws Exception {
        mvc.perform(post("/api/v1/brands").contentType(MediaType.APPLICATION_JSON).content("{"))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(brands);
    }

    @Test
    @DisplayName("HTTP GET resource ไม่มีต้องตอบ 404")
    void missingResourceReturns404() throws Exception {
        when(brands.getBrandById(999L)).thenThrow(new ResourceNotFoundException("Brand not found"));
        mvc.perform(get("/api/v1/brands/999")).andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @DisplayName("HTTP POST ขัดแย้ง unique constraint ต้องตอบ 409 ไม่ใช่ 500")
    void databaseConflictReturns409() throws Exception {
        when(brands.createBrand(any())).thenThrow(new DataIntegrityViolationException("duplicate brand name"));
        mvc.perform(post("/api/v1/brands").contentType(MediaType.APPLICATION_JSON).content("{\"brandName\":\"HTTPBrand\"}"))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("HTTP GET เมื่อเกิด unexpected internal exception ต้องตอบ 500 พร้อม error body")
    void unexpectedExceptionReturns500() throws Exception {
        when(brands.getBrandById(1L)).thenThrow(new IllegalStateException("simulated internal failure"));
        mvc.perform(get("/api/v1/brands/1")).andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.status").value(500)).andExpect(jsonPath("$.error").value("Internal Server Error"));
    }

    @Test
    @DisplayName("HTTP Method ที่ route ไม่รองรับต้องตอบ 405 ไม่ใช่ 500 และไม่เรียก service")
    void unsupportedMethodReturns405() throws Exception {
        mvc.perform(patch("/api/v1/brands/1").contentType(MediaType.APPLICATION_JSON).content("{\"brandName\":\"HTTPBrand\"}"))
                .andExpect(status().isMethodNotAllowed());
        verifyNoInteractions(brands);
    }
}
