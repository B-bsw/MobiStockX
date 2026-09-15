package com.example.mobistock.dto.request.category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CategoryRequest {

    @NotBlank(message = "Thai category name is required")
    @Size(max = 255, message = "Thai category name must not exceed 255 characters")
    private String categoryNameTh;

    @Size(max = 255, message = "English category name must not exceed 255 characters")
    private String categoryNameEn;
}
