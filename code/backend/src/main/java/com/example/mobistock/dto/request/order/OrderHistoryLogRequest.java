package com.example.mobistock.dto.request.order;

import com.example.mobistock.domain.enums.order.OrderAction;
import com.example.mobistock.domain.enums.order.OrderType;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class OrderHistoryLogRequest {

    @NotNull
    private OrderType orderType;

    @NotNull
    private Integer orderId;

    @NotNull
    private OrderAction action;

    private String description;
    private JsonNode oldData;
    private JsonNode newData;

    @Size(max = 255)
    private String actionBy;
}
