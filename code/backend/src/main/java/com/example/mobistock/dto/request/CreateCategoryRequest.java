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
public class CreateCategoryRequest {

    @NotBlank(message = "Category Thai name is required")
    private String categoryNameTh;

    private String categoryNameEn;

    @Builder.Default
    private Boolean isSerialized = true;
}
