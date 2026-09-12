package com.example.mobistock.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class SaleOrderImageResponse {

    private final Integer imageId;
    private final Integer saleId;
    private final String imageUrl;
    private final String imageCaption;
    private final LocalDateTime createdAt;
}
