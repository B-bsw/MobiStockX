package com.example.mobistock.dto.request.brand;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class BrandRequest {

    @NotBlank(message = "Brand name is required")
    @Size(max = 255, message = "Brand name must not exceed 255 characters")
    private String brandName;

    @Size(max = 255, message = "Brand country must not exceed 255 characters")
    private String brandCountry;

    @Size(max = 255, message = "Image URL must not exceed 255 characters")
    private String imageUrl;
}
