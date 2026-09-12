package com.example.mobistock.dto.request;

import com.example.mobistock.domain.enums.ItemStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ProductItemRequest {

    @Size(max = 100, message = "Serial number must not exceed 100 characters")
    private String serialNumber;

    @Size(max = 15, message = "IMEI must not exceed 15 characters")
    private String imei;

    @Size(max = 50, message = "Lot number must not exceed 50 characters")
    private String lotNumber;

    private ItemStatus status = ItemStatus.Available;

    @NotNull(message = "Model ID is required")
    private Integer modelId;
}
