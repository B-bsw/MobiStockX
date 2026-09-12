package com.example.mobistock.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class SupplierResponse {

    private final Integer supplierId;
    private final String supplierName;
    private final String phone;
    private final String email;
    private final String address;
    private final String contactPerson;
    private final String imageUrl;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;
}
