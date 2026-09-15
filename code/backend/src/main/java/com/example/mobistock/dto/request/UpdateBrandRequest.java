package com.example.mobistock.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateBrandRequest {

    @NotBlank(message = "Brand name is required")
    private String brandName;

    private String brandCountry;

    private String imageUrl;
}
