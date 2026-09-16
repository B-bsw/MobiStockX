package com.example.mobistock.service;

import com.example.mobistock.dto.request.CreateCustomerRequest;
import com.example.mobistock.dto.request.UpdateCustomerRequest;
import com.example.mobistock.dto.response.CustomerResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CustomerService {
    CustomerResponse createCustomer(CreateCustomerRequest request);
    CustomerResponse updateCustomer(Long customerId, UpdateCustomerRequest request);
    CustomerResponse getCustomerById(Long customerId);
    CustomerResponse getCustomerByPhone(String phone);
    Page<CustomerResponse> getAllCustomers(Pageable pageable);
    Page<CustomerResponse> searchCustomers(String keyword, Pageable pageable);
    void deleteCustomer(Long customerId);
}
