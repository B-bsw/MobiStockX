package com.example.mobistock.dto.request;

import com.example.mobistock.domain.enums.ItemStatus;
import jakarta.validation.constraints.NotNull;
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
public class UpdateProductItemStatusRequest {

    @NotNull(message = "Item status is required")
    private ItemStatus status;
}
