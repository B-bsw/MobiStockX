package com.example.mobistock.controller;

import com.example.mobistock.controller.api.CustomerController;
import com.example.mobistock.dto.request.CreateCustomerRequest;
import com.example.mobistock.dto.request.UpdateCustomerRequest;
import com.example.mobistock.dto.response.CustomerResponse;
import com.example.mobistock.exception.GlobalExceptionHandler;
import com.example.mobistock.exception.ResourceNotFoundException;
import com.example.mobistock.service.CustomerService;
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

@WebMvcTest(CustomerController.class)
@Import(GlobalExceptionHandler.class)
class CustomerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @MockitoBean
    private CustomerService customerService;

    @Test
    @DisplayName("POST /api/v1/customers - Should return 201 when customer registered successfully")
    void createCustomer_Success() throws Exception {
        CreateCustomerRequest request = CreateCustomerRequest.builder()
                .firstName("Somchai")
                .lastName("Jaidee")
                .phone("0812345678")
                .taxNumber("1409900123456")
                .address("123 Mittraphap Rd, Khon Kaen")
                .build();

        CustomerResponse response = CustomerResponse.builder()
                .customerId(1L)
                .firstName("Somchai")
                .lastName("Jaidee")
                .phone("0812345678")
                .taxNumber("1409900123456")
                .address("123 Mittraphap Rd, Khon Kaen")
                .build();

        when(customerService.createCustomer(any(CreateCustomerRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.firstName").value("Somchai"))
                .andExpect(jsonPath("$.data.phone").value("0812345678"));
    }

    @Test
    @DisplayName("POST /api/v1/customers - Should return 400 when required fields are missing")
    void createCustomer_ValidationError() throws Exception {
        CreateCustomerRequest request = CreateCustomerRequest.builder()
                .firstName("")
                .lastName("")
                .phone("")
                .build();

        mockMvc.perform(post("/api/v1/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"));
    }

    @Test
    @DisplayName("GET /api/v1/customers/{id} - Should return 200 when customer exists")
    void getCustomerById_Success() throws Exception {
        CustomerResponse response = CustomerResponse.builder()
                .customerId(1L)
                .firstName("Somchai")
                .lastName("Jaidee")
                .phone("0812345678")
                .build();

        when(customerService.getCustomerById(1L)).thenReturn(response);

        mockMvc.perform(get("/api/v1/customers/{id}", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.firstName").value("Somchai"));
    }

    @Test
    @DisplayName("GET /api/v1/customers/{id} - Should return 404 when customer not found")
    void getCustomerById_NotFound() throws Exception {
        when(customerService.getCustomerById(999L)).thenThrow(new ResourceNotFoundException("Customer not found with ID: 999"));

        mockMvc.perform(get("/api/v1/customers/{id}", 999L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Customer not found with ID: 999"));
    }

    @Test
    @DisplayName("GET /api/v1/customers/phone/{phone} - Should return 200 when customer found by phone")
    void getCustomerByPhone_Success() throws Exception {
        CustomerResponse response = CustomerResponse.builder()
                .customerId(1L)
                .firstName("Somchai")
                .lastName("Jaidee")
                .phone("0812345678")
                .build();

        when(customerService.getCustomerByPhone("0812345678")).thenReturn(response);

        mockMvc.perform(get("/api/v1/customers/phone/{phone}", "0812345678"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.phone").value("0812345678"));
    }

    @Test
    @DisplayName("GET /api/v1/customers - Should return 200 with paginated customers")
    void getAllCustomers_Success() throws Exception {
        List<CustomerResponse> customerList = List.of(
                CustomerResponse.builder().customerId(1L).firstName("Somchai").lastName("Jaidee").phone("0812345678").build(),
                CustomerResponse.builder().customerId(2L).firstName("Manee").lastName("Rakdee").phone("0898765432").build()
        );
        Page<CustomerResponse> page = new PageImpl<>(customerList, PageRequest.of(0, 20), 2);

        when(customerService.getAllCustomers(any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/api/v1/customers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content.length()").value(2))
                .andExpect(jsonPath("$.data.totalElements").value(2));
    }

    @Test
    @DisplayName("PUT /api/v1/customers/{id} - Should return 200 when updated successfully")
    void updateCustomer_Success() throws Exception {
        UpdateCustomerRequest request = UpdateCustomerRequest.builder()
                .firstName("Somchai Updated")
                .lastName("Jaidee")
                .phone("0812345678")
                .build();

        CustomerResponse response = CustomerResponse.builder()
                .customerId(1L)
                .firstName("Somchai Updated")
                .lastName("Jaidee")
                .phone("0812345678")
                .build();

        when(customerService.updateCustomer(eq(1L), any(UpdateCustomerRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/v1/customers/{id}", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.firstName").value("Somchai Updated"));
    }

    @Test
    @DisplayName("DELETE /api/v1/customers/{id} - Should return 204 No Content")
    void deleteCustomer_Success() throws Exception {
        doNothing().when(customerService).deleteCustomer(1L);

        mockMvc.perform(delete("/api/v1/customers/{id}", 1L))
                .andExpect(status().isNoContent());
    }
}
