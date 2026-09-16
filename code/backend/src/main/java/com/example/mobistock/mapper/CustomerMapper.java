package com.example.mobistock.mapper;

import com.example.mobistock.domain.entity.Customer;
import com.example.mobistock.dto.request.CreateCustomerRequest;
import com.example.mobistock.dto.response.CustomerResponse;
import org.springframework.stereotype.Component;

@Component
public class CustomerMapper {

    public Customer toCustomerEntity(CreateCustomerRequest request) {
        return Customer.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .taxNumber(request.getTaxNumber())
                .idCard(request.getIdCard())
                .address(request.getAddress())
                .build();
    }

    public CustomerResponse toCustomerResponse(Customer customer) {
        return CustomerResponse.builder()
                .customerId(customer.getCustomerId())
                .firstName(customer.getFirstName())
                .lastName(customer.getLastName())
                .phone(customer.getPhone())
                .taxNumber(customer.getTaxNumber())
                .idCard(customer.getIdCard())
                .address(customer.getAddress())
                .createdAt(customer.getCreatedAt())
                .updatedAt(customer.getUpdatedAt())
                .build();
    }
}
