package com.example.mobistock.service.impl;

import com.example.mobistock.domain.entity.Customer;
import com.example.mobistock.dto.request.CreateCustomerRequest;
import com.example.mobistock.dto.request.UpdateCustomerRequest;
import com.example.mobistock.dto.response.CustomerResponse;
import com.example.mobistock.exception.BadRequestException;
import com.example.mobistock.exception.ResourceNotFoundException;
import com.example.mobistock.mapper.CustomerMapper;
import com.example.mobistock.repository.CustomerRepository;
import com.example.mobistock.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final CustomerMapper customerMapper;

    @Override
    @Transactional
    public CustomerResponse createCustomer(CreateCustomerRequest request) {
        if (customerRepository.findByPhone(request.getPhone()).isPresent()) {
            throw new BadRequestException("Customer with phone number '" + request.getPhone() + "' already exists");
        }
        Customer customer = customerMapper.toCustomerEntity(request);
        Customer savedCustomer = customerRepository.save(customer);
        return customerMapper.toCustomerResponse(savedCustomer);
    }

    @Override
    @Transactional
    public CustomerResponse updateCustomer(Long customerId, UpdateCustomerRequest request) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + customerId));

        customer.setFirstName(request.getFirstName());
        customer.setLastName(request.getLastName());
        customer.setPhone(request.getPhone());
        customer.setTaxNumber(request.getTaxNumber());
        customer.setIdCard(request.getIdCard());
        customer.setAddress(request.getAddress());

        Customer updatedCustomer = customerRepository.save(customer);
        return customerMapper.toCustomerResponse(updatedCustomer);
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerResponse getCustomerById(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + customerId));
        return customerMapper.toCustomerResponse(customer);
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerResponse getCustomerByPhone(String phone) {
        Customer customer = customerRepository.findByPhone(phone)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with phone: " + phone));
        return customerMapper.toCustomerResponse(customer);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CustomerResponse> getAllCustomers(Pageable pageable) {
        return customerRepository.findAll(pageable)
                .map(customerMapper::toCustomerResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CustomerResponse> searchCustomers(String keyword, Pageable pageable) {
        return customerRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrPhoneContaining(
                keyword, keyword, keyword, pageable)
                .map(customerMapper::toCustomerResponse);
    }

    @Override
    @Transactional
    public void deleteCustomer(Long customerId) {
        if (!customerRepository.existsById(customerId)) {
            throw new ResourceNotFoundException("Customer not found with id: " + customerId);
        }
        customerRepository.deleteById(customerId);
    }
}
