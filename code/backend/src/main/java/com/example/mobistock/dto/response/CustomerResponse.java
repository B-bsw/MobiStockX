package com.example.mobistock.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class CustomerResponse {

    private final Integer customerId;
    private final String firstName;
    private final String lastName;
    private final String phone;
    private final String taxNumber;
    private final String address;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;
}
