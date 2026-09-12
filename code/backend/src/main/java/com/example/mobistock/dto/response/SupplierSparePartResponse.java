package com.example.mobistock.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class SupplierSparePartResponse {

    private final Integer supplierId;
    private final Integer partId;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;
}
