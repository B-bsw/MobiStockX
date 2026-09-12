package com.example.mobistock.dto.request.product;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ProductModelRequest {

    @NotBlank(message = "Model name is required")
    @Size(max = 255, message = "Model name must not exceed 255 characters")
    private String modelName;

    @Size(max = 100, message = "Made-in value must not exceed 100 characters")
    private String madeIn;

    @Min(value = 0, message = "Warranty duration must not be negative")
    private Integer warrantyDuration = 12;

    @NotNull(message = "Brand ID is required")
    private Integer brandId;

    @NotNull(message = "Category ID is required")
    private Integer categoryId;

    @Size(max = 255, message = "Image URL must not exceed 255 characters")
    private String imageUrl;
}
