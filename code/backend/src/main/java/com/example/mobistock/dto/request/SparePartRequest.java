package com.example.mobistock.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class SparePartRequest {

    @Size(max = 255, message = "Part name must not exceed 255 characters")
    private String partName;

    @Min(value = 0, message = "Quantity must not be negative")
    private Integer quantity = 0;

    @Size(max = 255, message = "Image URL must not exceed 255 characters")
    private String imageUrl;
}
