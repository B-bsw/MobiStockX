package com.example.mobistock.dto.request.saleOrder;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class SaleOrderImageRequest {

    @NotNull(message = "Sale ID is required")
    private Integer saleId;

    @NotBlank(message = "Image URL is required")
    @Size(max = 255, message = "Image URL must not exceed 255 characters")
    private String imageUrl;

    @Size(max = 255, message = "Image caption must not exceed 255 characters")
    private String imageCaption;
}
