package com.example.mobistock.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductWarrantyResponse {

    private Long warrantyId;
    private String warrantyCode;
    private String itemImei;
    private LocalDate startDate;
    private LocalDate expireDate;
    private String termsConditions;
    private String warrantyStatus;
    private LocalDateTime createdAt;
}
