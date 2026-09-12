package com.example.mobistock.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class SupplierSparePartRequest {

    @NotNull(message = "Supplier ID is required")
    private Integer supplierId;

    @NotNull(message = "Part ID is required")
    private Integer partId;
}
